import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Text,
  BlockStack,
  FormLayout,
  TextField,
  Button,
  InlineStack,
  Banner,
  Layout,
  Spinner,
  Modal,
} from '@shopify/polaris';
import { useApi, useData } from '@shopify/app-bridge-react';

const GET_PRODUCT_QUERY = `
  query getProductSeo($id: ID!) {
    product(id: $id) {
      id
      title
      descriptionHtml
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
  }
`;

export default function Index() {
  const { productId } = useData();
  const api = useApi();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for the AI Description Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyFeatures, setKeyFeatures] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesc, setGeneratedDesc] = useState('');

  const handleModalToggle = useCallback(() => {
    setIsModalOpen((active) => !active);
    if (isModalOpen) {
      setKeyFeatures('');
      setGeneratedDesc('');
    }
  }, [isModalOpen]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.graphql(GET_PRODUCT_QUERY, {
          variables: { id: productId },
        });
        if (data.product) {
          setProduct(data.product);
          setMetaTitle(data.product.seo?.title || '');
          setMetaDescription(data.product.seo?.description || '');
        }
      } catch (error) {
        console.error("Failed to fetch product data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, api]);

  const handleFormSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.fetch("/api/products/update_seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          metaTitle,
          metaDescription,
        }),
      });

      if (response.ok) {
        api.toast.show("Metadata saved successfully!");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.errors?.[0]?.message || "An unknown error occurred.";
        api.toast.show(`Error: ${errorMessage}`, { isError: true });
      }
    } catch (error) {
      console.error("Failed to submit form:", error);
      api.toast.show("An unexpected error occurred.", { isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (await api.navigator.clipboard.writeText(generatedDesc)) {
      api.toast.show("Description copied to clipboard!");
    } else {
      api.toast.show("Failed to copy to clipboard.", { isError: true });
    }
  };

  const handleGenerateDescription = async () => {
    if (!keyFeatures) {
      api.toast.show("Please enter at least one key feature.", { isError: true });
      return;
    }
    setIsGenerating(true);
    setGeneratedDesc('');

    try {
      const response = await api.fetch("/api/products/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTitle: product.title,
          keyFeatures,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedDesc(data.description);
        api.toast.show("Description generated!");
      } else {
        api.toast.show("Failed to generate description.", { isError: true });
      }
    } catch (error) {
      console.error("Failed to generate description:", error);
      api.toast.show("An unexpected error occurred.", { isError: true });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <BlockStack inlineAlign="center">
        <Spinner accessibilityLabel="Loading product data" />
      </BlockStack>
    );
  }

  if (!product) {
    return (
      <Banner title="Error" tone="critical">
        <p>Could not load product data. Please try again.</p>
      </Banner>
    );
  }

  // Content and SEO Analysis
  const h1Match = product.descriptionHtml?.match(/<h1.*?>/gi);
  const h1Count = h1Match ? h1Match.length : 0;
  const hasSingleH1 = h1Count === 1;

  // SEO Score Calculation
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
    <BlockStack gap="400">
      <Modal
        open={isModalOpen}
        onClose={handleModalToggle}
        title="Generate Full Description"
        primaryAction={{
          content: 'Generate',
          onAction: handleGenerateDescription,
          loading: isGenerating,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: handleModalToggle,
            disabled: isGenerating,
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Key Features or Keywords"
              value={keyFeatures}
              onChange={setKeyFeatures}
              multiline={4}
              autoComplete="off"
              helpText="Enter key features, benefits, or keywords, one per line."
            />
            {isGenerating && (
              <BlockStack inlineAlign="center" gap="200">
                <Spinner size="small" />
                <Text as="p">Generating...</Text>
              </BlockStack>
            )}
            {generatedDesc && (
              <BlockStack gap="200">
                <TextField
                  label="Generated Description"
                  value={generatedDesc}
                  onChange={setGeneratedDesc}
                  multiline={10}
                  autoComplete="off"
                />
                <Button onClick={handleCopy} variant="primary">Copy Description</Button>
              </BlockStack>
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>

      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingLg">
            SEO Score: {seoScore} / 100
          </Text>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">AI Content Tools</Text>
          <Button onClick={handleModalToggle}>Generate Full Description</Button>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text as="h2" variant="headingMd">
            Metadata Editor
          </Text>
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
            <Button onClick={handleFormSubmit} loading={isSubmitting}>
              Save Metadata
            </Button>
          </FormLayout>
        </BlockStack>
      </Card>
      <Layout>
        <Layout.Section>
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
                <li>Meta Description exists: {metaDescription ? "✅" : "❌"}</li>
                <li>Product Description exists: {product.descriptionHtml ? "✅" : "❌"}</li>
                <li>All images have alt text: {product.images.edges.every((edge) => edge.node.altText) ? "✅" : "❌"}</li>
                <li>Has exactly one &lt;h1&gt; tag: {hasSingleH1 ? "✅" : "❌"} (Found: {h1Count})</li>
              </ul>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </BlockStack>
  );
}
