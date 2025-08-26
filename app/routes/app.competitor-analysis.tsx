import { Page, Layout, Card, Text, IndexTable, Badge } from "@shopify/polaris";

// Mock data that would normally come from an SEO API like SEMrush or Ahrefs
const mockCompetitorData = [
  { keyword: 'summer fashion trends', yourRank: 3, competitorRank: 5 },
  { keyword: 'linen shirts for women', yourRank: 8, competitorRank: 4 },
  { keyword: 'beach vacation outfits', yourRank: 12, competitorRank: 15 },
  { keyword: 'sustainable clothing brands', yourRank: null, competitorRank: 7 },
  { keyword: 'minimalist jewelry', yourRank: 6, competitorRank: null },
];

export default function CompetitorAnalysisPage() {
  const resourceName = {
    singular: 'keyword',
    plural: 'keywords',
  };

  const rowMarkup = mockCompetitorData.map(
    (data, index) => {
      let rankComparison;
      if (data.yourRank && data.competitorRank) {
        if (data.yourRank < data.competitorRank) {
          rankComparison = <Badge tone="success">Winning</Badge>;
        } else if (data.yourRank > data.competitorRank) {
          rankComparison = <Badge tone="critical">Losing</Badge>;
        } else {
          rankComparison = <Badge>Tied</Badge>;
        }
      } else if (data.yourRank && !data.competitorRank) {
        rankComparison = <Badge tone="success">Opportunity</Badge>;
      } else {
        rankComparison = <Badge tone="critical">Content Gap</Badge>;
      }

      return (
        <IndexTable.Row id={data.keyword} key={data.keyword} position={index}>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              {data.keyword}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{data.yourRank || 'Not Ranked'}</IndexTable.Cell>
          <IndexTable.Cell>{data.competitorRank || 'Not Ranked'}</IndexTable.Cell>
          <IndexTable.Cell>{rankComparison}</IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  return (
    <Page title="Competitor Analysis">
      <Layout>
        <Layout.Section>
          <Card>
            <IndexTable
              resourceName={resourceName}
              itemCount={mockCompetitorData.length}
              headings={[
                { title: 'Keyword' },
                { title: 'Your Rank' },
                { title: 'Competitor Rank' },
                { title: 'Status' },
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
