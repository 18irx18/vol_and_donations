'use client'

import { ConfigProvider } from 'antd'
import React from 'react'

function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <ConfigProvider
            theme={{
                token : {
                    colorPrimary : '#439A97',
                    borderRadius: 2,  
                },
                components : {
                    Button : {
                        controlHeight: 40,
                        boxShadow: 'none',
                        colorPrimaryActive: '#439A97',
                        controlOutline: 'none',
                        colorBorder: '#439A97',
                        borderColorDisabled: 'transparent'
                    },
                    Input : {
                        controlHeight: 40,
                        activeBorderColor: '#439A97',
                        hoverBorderColor: '#439A97',
                        activeShadow: 'none',
                    },
                    Select : {
                        controlHeight: 40,
                        controlOutline: 'none',
                    }
                }
            }}>
                {children}
            </ConfigProvider>
        </div>
    )
}

export default ThemeProvider