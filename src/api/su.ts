
const VITE_SEARCH_SU_API = import.meta.env.VITE_SEARCH_SU_API

export const suSearch = async (params: {w: string}) => {
  const paramsInstance = new URLSearchParams(params)
  const res = await fetch(`${VITE_SEARCH_SU_API}?${paramsInstance.toString()}`, {
    method: 'GET',
  })
  return res.json()
}