
export const suSearch = async (params: {wd: string, cb: string}) => {
  const paramsInstance = new URLSearchParams(params)
  const res = await fetch(`/su?${paramsInstance.toString()}`, {
    method: 'GET',
  })
  const bufferRes = await res.arrayBuffer()
  const decoder = new TextDecoder('gbk'); 
  const text = decoder.decode(bufferRes);
  return new Function(`const SUJsonP = (data) => data; return ${text}`)();
}