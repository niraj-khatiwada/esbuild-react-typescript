import React from 'react'
import * as  esbuild from "esbuild-wasm"

import {unpkgPathPlugin} from "./plugins/unpkg-path-finder"

export default function App() {
    const [code, setCode] = React.useState<string | number | readonly string[] | undefined>('')
    const [result, setResult]  =React.useState<string | number | readonly string[] | undefined>('')
    const esBuildRef = React.useRef<Boolean>(false)

    const handleFormSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault()

        if(code !==undefined && esBuildRef.current){
            try {
                console.log(code?.toString())
                const bundledCode = await esbuild.build({
                    entryPoints:['index.js'],
                    bundle:true, 
                    write:false,
                    plugins:[unpkgPathPlugin()]
                })
                console.log("Bundling success", bundledCode)
                setResult(bundledCode.outputFiles[0].text)
    
            } catch (error) {
                console.log("Bundling error", {error})
            }

        }
    }

    const handleTextAreaChange = (evt:React.ChangeEvent<HTMLTextAreaElement>) => {
        setCode(evt.target.value)
    }

    React.useLayoutEffect(() => {
        if(!esBuildRef.current){
            esbuild.initialize({worker:true, wasmURL:'./node_modules/esbuild-wasm/esbuild.wasm'}).then(() => {esBuildRef.current=true}).catch(() => null)
        }
    },[])
    
    return (
        <div>
            <form onSubmit={handleFormSubmit}>
                <textarea name="code" cols={100} rows={10} value={code} onChange={handleTextAreaChange}  /> 
                <button type="submit">Submit</button>
            </form>
            {result}
        </div>
    )
}
