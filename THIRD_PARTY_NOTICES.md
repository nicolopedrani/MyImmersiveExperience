# Third-party notices

The runtime application uses original code-drawn Canvas graphics and system fonts. No legacy sprite sheet, flag sheet,
commercial game character or third-party visual asset is included.

## Runtime library

- `@huggingface/transformers@4.2.0` — Apache License 2.0. Its browser export is loaded only when the optional worker is
  requested after consent. Source: <https://github.com/huggingface/transformers.js>

Transitive dependencies retain their licenses as recorded in `package-lock.json` and package metadata. The deprecated
`boolean@3.2.0` package belongs to the unused Node backend dependency chain and is not distributed in `dist`.

## Optional model

- `onnx-community/Qwen3-0.6B-ONNX` — Apache License 2.0. Weights are not bundled in this repository or initial page
  request; a compatible browser can download `q4f16` weights from Hugging Face after explicit consent.
  Model card: <https://huggingface.co/onnx-community/Qwen3-0.6B-ONNX>

## Personal material

`public/CV_Pedrani.pdf`, Nicolò Pedrani's name, profile text and personal information are copyright Nicolò Pedrani and
are not relicensed as third-party assets by the application-source MIT license.
