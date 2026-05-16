# Project Notes

## Figma Source

- Original Figma file:
  `/Users/junjieding/Library/Containers/com.tencent.xinWeChat/Data/Library/Application Support/com.tencent.xinWeChat/2.0b4.0.9/03a7329fb9b727c4dc5e40cd4d5eeb9d/Message/MessageTemp/61ccf63bdaff4503ea6b664571280f4b/File/荆楚幻装UI 改好了.fig`
- Existing exported assets live under `assets/figma/` and `apps/web/public/figma/`.
- Use the `.fig` file when exact layout, layer bounds, or source assets are needed. If parsing the `.fig` is not necessary, compare against screenshots and the exported PNGs.

## Visual Implementation

- Do not blindly copy Figma text box heights or line-height when they are only used as loose layout boxes. Recreate the visible spacing, especially for compact controls such as the `返回` button.
- Detail confirmation pages are largely the same layout. Keep shared controls and repeated structures as shared components/styles instead of duplicating per page.
- After visual changes, verify with `d3k` screenshots on `http://127.0.0.1:5173/control?...` for both selection and detail pages.
