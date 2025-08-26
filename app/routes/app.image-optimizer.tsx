import { useState, useEffect } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  ButtonGroup,
  Button,
  IndexTable,
  TextField,
  Thumbnail,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";

const GET_PRODUCTS_AND_IMAGES_QUERY = `
  query getProductsAndImages($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");

  const response = await admin.graphql(GET_PRODUCTS_AND_IMAGES_QUERY, {
    variables: {
      first: 10,
      after: cursor,
    },
  });

  const responseJson = await response.json();
  return json(responseJson.data.products);
};

export default function ImageOptimizerPage() {
  const productsData = useLoaderData<typeof loader>();
  const { pageInfo, edges: products } = productsData;
  const app = useAppBridge();

  const images = products.flatMap(product =>
    product.node.images.edges.map(imageEdge => ({
      ...imageEdge.node,
      productId: product.node.id,
      productTitle: product.node.title,
    }))
  );

  const [altTexts, setAltTexts] = useState({});
  const [loadingStates, setLoadingStates] = useState({});

  useEffect(() => {
    // Initialize the state with the alt text from the loader
    const initialAltTexts = {};
    images.forEach(image => {
      initialAltTexts[image.id] = image.altText || '';
    });
    setAltTexts(initialAltTexts);
  }, [JSON.stringify(images)]); // Use JSON.stringify to deep compare

  const handleAltTextChange = (imageId, value) => {
    setAltTexts(prev => ({ ...prev, [imageId]: value }));
  };

  const handleSave = async (imageId) => {
    setLoadingStates(prev => ({ ...prev, [imageId]: true }));
    const altText = altTexts[imageId];

    try {
      const response = await app.fetch("/api/images/update_alt_text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, altText }),
      });

      if (response.ok) {
        app.toast.show("Alt text saved!");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.errors?.[0]?.message || "An unknown error occurred.";
        app.toast.show(`Error: ${errorMessage}`, { isError: true });
      }
    } catch (error) {
      console.error("Failed to save alt text:", error);
      app.toast.show("An unexpected error occurred.", { isError: true });
    } finally {
      setLoadingStates(prev => ({ ...prev, [imageId]: false }));
    }
  };

  const resourceName = {
    singular: 'image',
    plural: 'images',
  };

  const rowMarkup = images.map(
    (image, index) => (
      <IndexTable.Row id={image.id} key={image.id} position={index}>
        <IndexTable.Cell>
          <Text variant="bodyMd" as="span">{image.productTitle}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Thumbnail source={image.url} alt={altTexts[image.id] || ''} size="medium" />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <TextField
            label={`Alt text for ${image.productTitle}`}
            labelHidden
            value={altTexts[image.id] || ''}
            onChange={(value) => handleAltTextChange(image.id, value)}
            autoComplete="off"
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Button
            size="slim"
            onClick={() => handleSave(image.id)}
            loading={loadingStates[image.id]}
          >
            Save
          </Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page title="Image Optimizer">
      <Layout>
        <Layout.Section>
          <Card>
            <IndexTable
              resourceName={resourceName}
              itemCount={images.length}
              headings={[
                { title: 'Product' },
                { title: 'Image' },
                { title: 'Alt Text' },
                { title: 'Action' },
              ]}
              selectable={false}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
          <Card>
            <ButtonGroup>
              <Button
                as={RemixLink}
                to={`/app/image-optimizer?cursor=${pageInfo.endCursor}`}
                disabled={!pageInfo.hasNextPage}
              >
                Next Page
              </Button>
            </ButtonGroup>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
