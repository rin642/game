import type { Metadata, Viewport } from "next";
import { Fredoka, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fredoka",
});

const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-zen-maru",
});

export const metadata: Metadata = {
  title: "ドリームポップ・アドベンチャー ✨ | かわいいパステルブラウザゲーム",
  description: "カラフルな夢の世界を冒険しながら、星やハート、キャンディを集めるポップでかわいいブラウザアクションゲーム！",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${fredoka.variable} ${zenMaruGothic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans select-none bg-pink-50 text-gray-800">
        {children}
      </body>
    </html>
  );
}
