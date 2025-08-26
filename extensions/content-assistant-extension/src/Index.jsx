import React, { useState } from 'react';
import {
  BlockStack,
  Text,
  TextField,
  Button,
  Card,
  Spinner,
} from '@shopify/polaris';
import { useApi } from '@shopify/app-bridge-react';

export default function Index() {
  const api = useApi();
  const [keyword, setKeyword] = useState('');
  const [outline, setOutline] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateClick = async () => {
    if (!keyword) {
      api.toast.show("Please enter a keyword.", { isError: true });
      return;
    }
    setIsLoading(true);
    setOutline(null);

    try {
      const response = await api.fetch("/api/content/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });

      if (response.ok) {
        const generatedOutline = await response.json();
        setOutline(generatedOutline);
      } else {
        api.toast.show("Failed to generate outline.", { isError: true });
      }
    } catch (error) {
      console.error("Failed to generate outline:", error);
      api.toast.show("An unexpected error occurred.", { isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BlockStack gap="400">
      <Text variant="headingMd">Content Rank Assistant</Text>
      <Card>
        <BlockStack gap="400">
          <TextField
            label="Target Keyword"
            value={keyword}
            onChange={setKeyword}
            autoComplete="off"
            placeholder="e.g., summer fashion trends"
          />
          <Button onClick={handleGenerateClick} loading={isLoading}>
            Generate Outline
          </Button>
        </BlockStack>
      </Card>

      {isLoading && (
        <Card>
          <BlockStack inlineAlign="center" gap="200">
            <Spinner size="small" />
            <Text as="p">Generating outline...</Text>
          </BlockStack>
        </Card>
      )}

      {outline && (
        <Card>
          <BlockStack gap="400">
            <Text variant="headingLg" as="h1">{outline.h1}</Text>
            {outline.sections.map((section, index) => (
              <BlockStack key={index} gap="200">
                <Text variant="headingMd" as="h2">{section.h2}</Text>
                {section.h3s.length > 0 && (
                  <ul>
                    {section.h3s.map((h3, h3Index) => (
                      <li key={h3Index}><Text as="p">{h3}</Text></li>
                    ))}
                  </ul>
                )}
              </BlockStack>
            ))}
          </BlockStack>
        </Card>
      )}
    </BlockStack>
  );
}
