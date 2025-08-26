import { Page, Layout, Card, Text, BlockStack, Link as PolarisLink } from "@shopify/polaris";

// Mock data that would normally come from an SEO API like Ahrefs
const mockBacklinkData = [
  {
    id: 'link1',
    domain: 'fashionista-blog.com',
    authorityScore: 78,
    dateFound: '2025-08-24',
    linkingTo: '/products/linen-shirt',
  },
  {
    id: 'link2',
    domain: 'style-review-weekly.net',
    authorityScore: 62,
    dateFound: '2025-08-22',
    linkingTo: '/collections/summer-collection',
  },
  {
    id: 'link3',
    domain: 'outfit-inspiration.io',
    authorityScore: 85,
    dateFound: '2025-08-21',
    linkingTo: '/',
  },
];

export default function BacklinkMonitoringPage() {
  return (
    <Page title="Backlink Monitoring">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {mockBacklinkData.map((link) => (
              <Card key={link.id}>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    <PolarisLink url={`http://${link.domain}`} target="_blank" removeUnderline>
                      {link.domain}
                    </PolarisLink>
                  </Text>
                  <Text as="p" tone="subdued">
                    Linking to your page: <Text as="span" fontWeight="semibold">{link.linkingTo}</Text>
                  </Text>
                  <Text as="p" tone="subdued">
                    Authority Score: <Text as="span" fontWeight="semibold">{link.authorityScore}</Text>
                  </Text>
                  <Text as="p" tone="subdued">
                    Date Found: {link.dateFound}
                  </Text>
                </BlockStack>
              </Card>
            ))}
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
