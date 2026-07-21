import "./globals.css";

export const metadata = {
  title: "Abdul Hanan | Portfolio",
  description:
    "LinkedIn-inspired portfolio for Abdul Hanan, Full Stack Developer and AI enthusiast."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
