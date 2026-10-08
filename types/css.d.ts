import "react";

// 允许在 style 里直接写 CSS 自定义属性（--d、--i、--tc 这类），不必每处 as CSSProperties
declare module "react" {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
