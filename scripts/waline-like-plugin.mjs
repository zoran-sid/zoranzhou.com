import { fileURLToPath } from "node:url";

// Narrow patch for the pinned client 3.16.1. Keep Vue rendering, login and APIs
// upstream-owned; replace only its wait-then-update like handler at bundle time.
const original =
  "le=async e=>{let{serverURL:t,lang:n}=d.value,{objectId:i}=e,o=a.value.includes(i);await u({serverURL:t,lang:n,objectId:i,token:r.value.token,comment:{like:!o}}),o?a.value=a.value.filter(e=>e!==i):(a.value=[...a.value,i],a.value.length>50&&(a.value=a.value.slice(-50))),e.like=Math.max(0,(e.like||0)+(o?-1:1))}";
const replacement = `le=(()=>{
  const transport=zoranCreateLikeTransport(d.value.serverURL);
  const like=zoranCreateCommentLikeHandler({
    likes:a, getUser:()=>r.value, ...transport,
    report:(id,state,liked)=>document.dispatchEvent(new CustomEvent("waline:like-feedback",{detail:{id,state,liked}}))
  });
  pe(()=>[r.value.token,...zoranFlattenComments(p.value).map(c=>c.objectId)],()=>{void like.sync(zoranFlattenComments(p.value));},{immediate:true,flush:"post"});
  oe(()=>like.dispose());
  return like;
})()`;
const helper = fileURLToPath(
  new URL("../src/lib/comment-like.ts", import.meta.url),
);

export function patchWalineLikes(code) {
  if (!code.includes("Dt=`3.16.1`") || code.split(original).length !== 2) {
    throw new Error(
      "Waline like patch no longer matches client 3.16.1. Review the new client before upgrading.",
    );
  }
  return `import { createCommentLikeHandler as zoranCreateCommentLikeHandler, createLikeTransport as zoranCreateLikeTransport, flattenComments as zoranFlattenComments } from ${JSON.stringify(helper)};\n${code.replace(original, replacement)}`;
}

/** @returns {import("vite").Plugin} */
export default function walineLikePlugin() {
  return {
    name: "zoran-waline-like-feedback",
    enforce: "pre",
    transform(code, id) {
      if (
        !id
          .split("?")[0]
          .replaceAll("\\", "/")
          .endsWith("/@waline/client/dist/slim.js")
      )
        return;
      return { code: patchWalineLikes(code), map: null };
    },
  };
}
