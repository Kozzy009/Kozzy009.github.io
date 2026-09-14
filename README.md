# KOZZY’S ROOM V6 STEP14 — BATCH POLISH

まとめて処理した内容：

- style.css を新規作成して全ページ共通デザインを復元
- script.js を新規作成してモバイルメニューを実装
- STEP13までの内容を踏まえ、トップのレトロ感と見やすさを両立
- OPEN ROOM チケットは S と重ならない位置を維持
- 全ページのナビに current 表示を追加
- WHAT’S NEW / NOW PLAYING / CURRENT / ABOUT を共通デザインで整理
- 下層ページの見出し・余白・ボタン・一覧を統一

この版は、公開前の土台としてかなり使いやすい状態です。


## STEP16 — NOW PLAYING / Apple Music
- 01 Bruce Springsteen「Prove It All Night」へ変更
- 02 高田渡「銭がなけりゃ」
- 03 金延幸子「時にまかせて」
- 3曲すべてApple Musicの指定URLへ直接リンク
- NOW PLAYINGの各項目全体をクリック可能に変更


## STEP17
- 「じぶんばす」を今回の掲載対象から外しました
- APPSの02を「TYPE64」に差し替えました
- WHAT'S NEWの02もTYPE64に変更しました
- TYPE64本体を `type64/index.html` としてサイト内に同梱しました
- TYPE64は独自64項目の自己理解ツールとして掲載しています


## STEP19 — TYPE64 最新版・見た目のみ変更
- ユーザー提供の最新版 `TYPE64｜20問クイック + 64問詳細診断` を正本として採用
- 20問クイック、64問詳細、自己確認、AI画像プロンプトなどの内容・JavaScriptロジックは変更なし
- `<style>` 内のCSSだけをKOZZY’S ROOMの古紙／錆赤／マスタード／青緑のレトロデザインへ変更


## STEP20 — PUBLIC READY
公開準備を一括処理。SEO基本設定、favicon、manifest、404、robots、アクセシビリティ、リンク監査を追加。
TYPE64本体はSTEP19の最新版をそのまま維持しています。
