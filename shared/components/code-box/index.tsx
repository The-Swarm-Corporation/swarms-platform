import React, { useEffect } from "react";
import ReactPrismjs from "@uiw/react-prismjs";
import 'prismjs/themes/prism-tomorrow.css';

interface CodeBoxItems {
    title?: string;
    sourceCode: string;
}

interface CodeBox {
    sampleCodes: Record<string, CodeBoxItems>;
    language: string;
}

export default function Code({ language, sampleCodes }: CodeBox) {


  return (
    <>
        <ReactPrismjs prefixCls="prism" language={language} source="console.log('Hello Wold!')" />
    </>
  );
}