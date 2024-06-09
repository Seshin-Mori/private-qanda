/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // 静的ファイルをエクスポートするために必要
  distDir: "out", // ビルド出力先ディレクトリを指定
};

export default nextConfig;
