# 🌧 Raindrop Project

インタラクティブ縦書きWeb小説「雨粒が」用のビジュアライゼーションプロジェクト。

## 📘 概要
- 2本の物語（少年視点／水滴視点）が並行して進行し、分岐と合流を繰り返す構成。
- スマホでの読書体験に特化。縦書きで自然な分岐操作が可能。
- 最終的に分岐が収束して1本の文章になる演出を目指す。

## 🎨 表現方式
本リポジトリは以下の2種類の表現を同時に開発・比較します：

| パターン       | 技術               | ディレクトリ         |
|----------------|--------------------|----------------------|
| DOM+CSS版      | HTML / CSS / JS    | `src/app1/`   |
| Three.js版     | WebGL / Canvas     | `src/app2/`   |


## 🧱 構成

```
raindrop-viz/
├── public/
│   └── snenario.csv          # ローカル編集されたシナリオデータ
├── src/
│   ├── app1/
│   │   ├── index.html
│   │   ├── main.js
│   │   └── style.css
│   ├── app2/
│   │   ├── index.html
│   │   ├── main.js
│   │   └── style.css
│   └── lib/
│       └── parseCsv.js       # CSVをJSONに変換する関数
├── vite.config.js
├── package.json
└── README.md
```

## 🚀 起動方法

```bash
pnpm install
pnpm run dev
```

アクセス：

- `http://localhost:5173/src/app1/index.html` → HTML+CSS版
- `http://localhost:5173/src/app2/index.html` → Three.js版


## 📋 実装済み

### 共通
- `parseCsv.js`: CSVファイルからJSON形式に変換

### DOM版
- 縦書きレイアウトを使ったテキスト表示
- `style.fontSize` の適用によるスタイル制御

### Three.js版
- 各ノード（文節）を3D空間に配置
- `TextGeometry` で文章を立体化


## 🧪 今後の拡張予定
- 分岐ノードの描画（ベジェカーブ or canvas flow）
- ユーザー選択によるルート分岐
- 最終行のマージ演出
- `emotion`, `style` による演出効果の反映


---

## ✏️ 著者メモ（抜粋）
- テーマ：「自然と記憶」「アイデンティティの流動性」
- 最初の分岐で2つの物語（少年／水滴）に分かれる
- 最後に同一のテキストが異なる意味で読まれる構造を目指す
- 読者の手触り感：「水流に手を添えて読む感覚」
