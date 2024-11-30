import "./globals.css";

export const metadata = {
  title: "Life Organizer",
  description: "Organizing life is as easy as organizing files.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
