import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { admin } = await authenticate.admin(request);
  const { imageId, altText } = await request.json();

  if (!imageId || altText === undefined) {
    return json({ error: 'Missing required fields' }, { status: 400 });
  }

  const response = await admin.graphql(
    `#graphql
      mutation imageUpdate($input: ImageInput!) {
        imageUpdate(input: $input) {
          image {
            id
            altText
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
          id: imageId,
          altText: altText,
        },
      },
    }
  );

  const responseJson = await response.json();

  if (responseJson.data.imageUpdate.userErrors.length > 0) {
    return json({ errors: responseJson.data.imageUpdate.userErrors }, { status: 422 });
  }

  return json({ success: true, image: responseJson.data.imageUpdate.image });
};
