"use strict";
const byId = id => document.getElementById(id);
let fileUrl;
function lock() {
  if (fileUrl) URL.revokeObjectURL(fileUrl);
  fileUrl = null;
  byId("file").removeAttribute("href");
  byId("download").hidden = true;
  byId("gate").hidden = false;
  byId("key").value = "";
}
byId("lock").addEventListener("click", () => { lock(); byId("key").focus(); });
window.addEventListener("pagehide", lock);
byId("entry").addEventListener("submit", async event => {
  event.preventDefault();
  const button = byId("unlock"), error = byId("error");
  button.disabled = true;
  error.textContent = "";
  let release;
  try {
    const response = await fetch("./release.json", {cache:"no-store", credentials:"omit", referrerPolicy:"no-referrer"});
    if (!response.ok) throw new Error();
    release = await response.json();
    const data = await unlockRelease(byId("key").value, release);
    fileUrl = URL.createObjectURL(new Blob([data], {type:"application/zip"}));
    byId("file").href = fileUrl;
    byId("key").value = "";
    byId("gate").hidden = true;
    byId("download").hidden = false;
    byId("ready").focus();
  } catch {
    error.textContent = release ? "That key could not unlock this release. Check the full key or ask the owner for a new one."
                                : "The download is temporarily unavailable. Try again shortly.";
  } finally { button.disabled = false; }
});
