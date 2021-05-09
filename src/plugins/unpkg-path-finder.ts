import * as esbuild from 'esbuild-wasm';
import axios from "axios"

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log('onResolve', args);
        const path  = args.path
        const importer  = args.importer
        if(path==='index.js'){
          return { path, namespace: 'a' };
        } 
        if(path?.includes("./") || path?.includes("../")){
          const newPath = new URL(path,importer?.endsWith("/")?importer:`${importer}/`).href
          console.log("new path", newPath)
          return   {
            path: newPath, namespace: 'a' 
          }
        }
        return {
          path: `https://unpkg.com/${path}@17.0.1/index.js`, namespace: 'a' 
        }
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);

        const path  = args.path

        if (path === 'index.js') {
          return {
            loader:'jsx',
            contents:'const message = require("react");'
          }
          
        }


        try {
          const response  = await axios.get(path)
          console.log('----',response)
          return {
            loader: 'jsx',
            contents:response?.data,
          };
        } catch (error) {
          console.log("Package fetch error", {error})
          throw new Error(error)
        }
      });
    },
  };
};