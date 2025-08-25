import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation, Form } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  FormLayout,
  TextField,
  Button,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";


// Fetches product data on the server
export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const productId = `gid://shopify/Product/${params.id}`;

  const response = await admin.graphql(
    `#graphql
      query getProductSeo($id: ID!) {
        product(id: $id) {
          id
          title
          descriptionHtml
          onlineStoreUrl
          seo {
            title
            description
          }
          images(first: 5) {
            edges {
              node {
                id
                altText
                url
              }
            }
          }
        }
      }`,
    {
      variables: {
        id: productId,
      },
    }
  );

  const responseJson = await response.json();
  if (!responseJson.data.product) {
    throw new Response("Product not found", { status: 404 });
  }
  return json(responseJson.data.product);
};

// Handles form submission to update metadata
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const metaTitle = formData.get("metaTitle") as string;
  const metaDescription = formData.get("metaDescription") as string;
  const productId = `gid://shopify/Product/${params.id}`;

  const response = await admin.graphql(
    `#graphql
      mutation updateProductSeo($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            seo {
              title
              description
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: {
        input: {
          id: productId,
          seo: {
            title: metaTitle,
            description: metaDescription,
          },
        },
      },
    }
  );

  const responseJson = await response.json();

  if (responseJson.data.productUpdate.userErrors.length > 0) {
    return json({ errors: responseJson.data.productUpdate.userErrors }, { status: 422 });
  }

  return json({ product: responseJson.data.productUpdate.product });
};


// Renders the SEO Audit page
export default function SeoAuditPage() {
  const product = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const shopify = useAppBridge();

  const [metaTitle, setMetaTitle] = useState(product.seo?.title || "");
  const [metaDescription, setMetaDescription] = useState(
    product.seo?.description || ""
  );

  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.product) {
      shopify.toast.show("Metadata saved successfully!");
    } else if (actionData?.errors) {
      shopify.toast.show("Error saving metadata.", { isError: true });
    }
  }, [actionData, shopify]);


  // Content and SEO Analysis
  const h1Match = product.descriptionHtml?.match(/<h1.*?>/gi);
  const h1Count = h1Match ? h1Match.length : 0;
  const hasSingleH1 = h1Count === 1;

  // Simple SEO Score Calculation
  const calculateSeoScore = () => {
    let score = 0;
    if (metaTitle) score += 20;
    if (metaDescription) score += 20;
    if (product.descriptionHtml) score += 20;
    const imagesWithoutAlt = product.images.edges.filter(
      (edge) => !edge.node.altText
    ).length;
    if (imagesWithoutAlt === 0) score += 20;
    if (hasSingleH1) score += 20;
    return score;
  };

  const seoScore = calculateSeoScore();

  return (
    <Page
      title={`SEO Audit for ${product.title}`}
      backAction={{ content: "Products", url: "/app/products" }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                SEO Score: {seoScore} / 100
              </Text>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Metadata Editor
              </Text>
              <Form method="post">
                <FormLayout>
                  <TextField
                    name="metaTitle"
                    label="Meta Title"
                    value={metaTitle}
                    onChange={setMetaTitle}
                    autoComplete="off"
                    helpText={`Character count: ${metaTitle.length}`}
                  />
                  <TextField
                    name="metaDescription"
                    label="Meta Description"
                    value={metaDescription}
                    onChange={setMetaDescription}
                    autoComplete="off"
                    multiline={4}
                    helpText={`Character count: ${metaDescription.length}`}
                  />
                  <Button submit loading={isSubmitting}>Save Metadata</Button>
                </FormLayout>
              </Form>
            </BlockStack>
          </Card>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Image Alt Text
              </Text>
              {product.images.edges.length > 0 ? (
                product.images.edges.map((edge) => (
                  <InlineStack key={edge.node.id} gap="400" blockAlign="center" wrap={false}>
                    <img
                      src={edge.node.url}
                      alt={edge.node.altText || 'Missing alt text'}
                      width="60"
                      height="60"
                      style={{objectFit: 'cover', borderRadius: '4px'}}
                    />
                    <Text as="span" tone={edge.node.altText ? 'success' : 'critical'}>
                      {edge.node.altText
                        ? `Alt text: "${edge.node.altText}"`
                        : "❌ Missing alt text"}
                    </Text>
                  </InlineStack>
                ))
              ) : (
                <Text as="p">This product has no images.</Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                SEO Checklist
              </Text>
              <ul>
                <li>Meta Title exists: {metaTitle ? "✅" : "❌"}</li>
                <li>
                  Meta Description exists: {metaDescription ? "✅" : "❌"}
                </li>
                <li>
                  Product Description exists:{" "}
                  {product.descriptionHtml ? "✅" : "❌"}
                </li>
                <li>
                  All images have alt text:{" "}
                  {product.images.edges.every((edge) => edge.node.altText)
                    ? "✅"
                    : "❌"}
                </li>
                <li>
                  Has exactly one &lt;h1&gt; tag: {hasSingleH1 ? "✅" : "❌"} (Found: {h1Count})
                </li>
              </ul>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
