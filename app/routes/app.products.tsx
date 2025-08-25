import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  IndexTable,
  Text,
  Link,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

// Fetch products on the server
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query getProducts {
        products(first: 10) {
          edges {
            node {
              id
              title
              onlineStoreUrl
              handle
            }
          }
        }
      }`
  );

  const responseJson = await response.json();
  return responseJson.data.products.edges;
};

// Render the product list
export default function ProductsPage() {
  const products = useLoaderData<typeof loader>();

  const resourceName = {
    singular: 'product',
    plural: 'products',
  };

  const rowMarkup = products.map(
    ({ node }, index) => {
      // Extract the numeric ID from the full GID
      const productId = node.id.split('/').pop();
      return (
        <IndexTable.Row id={node.id} key={node.id} position={index}>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {node.title}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Link url={`/app/seo/${productId}`} data-primary-link>
              View SEO Audit
            </Link>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Link url={node.onlineStoreUrl} target="_blank" removeUnderline>
              View on Store
            </Link>
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    },
  );

  return (
    <Page title="Products">
      <Layout>
        <Layout.Section>
          <Card>
            <IndexTable
              resourceName={resourceName}
              itemCount={products.length}
              headings={[
                {title: 'Product'},
                {title: 'SEO Audit'},
                {title: 'Link'},
              ]}
              selectable={false}
            >
              {rowMarkup}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
