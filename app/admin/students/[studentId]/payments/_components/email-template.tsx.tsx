// EmailTemplate.tsx
import { Html, Body, Container, Text } from "@react-email/components";

export function EmailTemplate({
  firstName,
  amount,
}: {
  firstName: string;
  amount: number;
}) {
  return (
    <Html>
      <Body>
        <Container>
          <Text>Hello {firstName},</Text>
          <Text>We received your payment of {amount}.</Text>
        </Container>
      </Body>
    </Html>
  );
}
