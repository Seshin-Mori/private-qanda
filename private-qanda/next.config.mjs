/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // 静的ファイルをエクスポートするために必要
  distDir: "out", // ビルド出力先ディレクトリを指定
  //データ不整合のレスが消える
  //trailingSlash: true, // これを追加して全てのURLにスラッシュを追加
};

export default nextConfig;
