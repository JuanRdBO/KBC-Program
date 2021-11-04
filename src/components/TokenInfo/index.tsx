import { PublicKey } from "@solana/web3.js";
import React, { CSSProperties, useState } from "react";

export function TokenIcon(props: { iconSize?: number , logoURI?: string, style?: CSSProperties}) {
    const { iconSize = 24 ,logoURI=undefined, style={}} = props;

    return (
      <div
        style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%',
            height: iconSize,
            width: iconSize,
            display: 'inline-flex',
            overflow: 'hidden',
            ...style
        }}
      >
        {logoURI ? (
          <img alt="Logo" style={style} src={logoURI} />
        ) : (
          <div style={style}></div>
        )}
      </div>
    );
  }
  

export function TokenName(props: { tokenName?: string, tokenSymbol?:string, style?: CSSProperties}) {
    const {tokenName=undefined, tokenSymbol=undefined, style={}} = props;
  
    return (
      <div style={{ marginLeft: "16px", overflow: 'hidden' }}>
        <div style={{ fontWeight: 500, color: 'white', }}>
          {tokenName}
        </div>
        <div color="textSecondary" style={{ fontSize: "14px", color: '#797A8C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', }}>
          {tokenSymbol}
        </div>
      </div>
    );
  }