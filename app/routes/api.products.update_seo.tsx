import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { admin } = await authenticate.admin(request);
  const { productId, metaTitle, metaDescription } = await request.json();

  if (!productId || metaTitle === undefined || metaDescription === undefined) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  const response = await admin.graphql(
    `#graphql
      mutation updateProductSeo($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
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

  return json({ success: true, product: responseJson.data.productUpdate.product });
};
