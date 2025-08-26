import { Page, Card, Text, BlockStack, Grid, VerticalStack, Link as PolarisLink } from "@shopify/polaris";
import { Link as RemixLink } from "@remix-run/react";

// Mock data that would normally come from Google Search Console / Analytics APIs
const mockDashboardData = {
  organicClicks: {
    value: "1.2k",
    change: "+15%",
  },
  organicImpressions: {
    value: "8.5k",
    change: "+12%",
  },
  overallSeoScore: 88,
};

export default function DashboardPage() {
  return (
    <Page title="SEO Performance Dashboard">
      <BlockStack gap="400">
        <Grid>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Organic Clicks</Text>
                <Text as="h1" variant="headingXl">{mockDashboardData.organicClicks.value}</Text>
                <Text as="p" tone="success">{mockDashboardData.organicClicks.change} vs. previous 30 days</Text>
                <img src="https://placehold.co/600x200/green/white?text=Clicks+Chart" alt="Placeholder chart for organic clicks" style={{width: '100%', marginTop: '16px'}}/>
              </BlockStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
            <Card>
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">Organic Impressions</Text>
                <Text as="h1" variant="headingXl">{mockDashboardData.organicImpressions.value}</Text>
                <Text as="p" tone="success">{mockDashboardData.organicImpressions.change} vs. previous 30 days</Text>
                <img src="https://placehold.co/600x200/blue/white?text=Impressions+Chart" alt="Placeholder chart for organic impressions" style={{width: '100%', marginTop: '16px'}}/>
              </BlockStack>
            </Card>
          </Grid.Cell>
        </Grid>
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">App Tools</Text>
            <VerticalStack gap="200">
              <RemixLink to="/app/products" style={{textDecoration: 'none'}}>
                <PolarisLink removeUnderline>On-Page SEO Audit Tool</PolarisLink>
              </RemixLink>
              <RemixLink to="/app/image-optimizer" style={{textDecoration: 'none'}}>
                <PolarisLink removeUnderline>Bulk Image Alt Text Editor</PolarisLink>
              </RemixLink>
              <RemixLink to="/app/competitor-analysis" style={{textDecoration: 'none'}}>
                <PolarisLink removeUnderline>Competitor Analysis Tool</PolarisLink>
              </RemixLink>
            </VerticalStack>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">Overall Store SEO Score</Text>
            <Text as="h1" variant="headingXl">{mockDashboardData.overallSeoScore} / 100</Text>
            <Text as="p" tone="subdued">Based on a comprehensive audit of your store.</Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
