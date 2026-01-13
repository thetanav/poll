import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Poll - Create polls. Get answers.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}>
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 48,
          }}>
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#171717",
              marginLeft: 16,
            }}>
            Poll
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#171717",
              lineHeight: 1.1,
            }}>
            Create polls.
          </span>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#171717",
              lineHeight: 1.1,
            }}>
            Get answers.
          </span>
        </div>

        {/* Subtext */}
        <span
          style={{
            fontSize: 28,
            color: "#737373",
            marginTop: 32,
          }}>
          Real-time voting. Free forever.
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
