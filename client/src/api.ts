const BASE=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export type Service={id:string;title:string;description:string;price:string;duration:number;image?:string;category:{id:string;name:string};provider:{name:string};reviews:{rating:number}[]};
export type Category={id:string;name:string;icon?:string};
export type PaginationMeta={page:number;limit:number;total:number;totalPages:number};

async function request<T>(path:string,options:RequestInit={}){const token=localStorage.getItem('token');const res=await fetch(BASE+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}) ,...options.headers}});const text=await res.text();let json:{message?:string;data?:T;meta?:PaginationMeta}={};try{json=text?JSON.parse(text):{}}catch{if(!res.ok)throw new Error(`API request failed (${res.status})`)}if(!res.ok)throw new Error(json.message||`API request failed (${res.status})`);return json}
export async function api<T>(path:string,options:RequestInit={}){return (await request<T>(path,options)).data as T}
export async function apiPaginated<T>(path:string,options:RequestInit={}){const response=await request<T[]>(path,options);return{data:response.data||[],meta:response.meta||{page:1,limit:20,total:0,totalPages:1}}}
