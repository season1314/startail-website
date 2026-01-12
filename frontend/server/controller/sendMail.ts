"use server";
import { setCache, getCache, clearCache } from "@/server/methods/cache"
import type { RegistrationRecord } from "@/server/interface/cacheInterface"
import http from "@/server/methods/http"
import { hash } from "@/server/methods/hash"
import { mail } from "@/server/methods/mail"
import { Html } from "next/document";
import { encodeData } from "@/server/methods/crypto"

export async function sendRegisterEmail(email: string, key: string) {

  // await clearCache()
  //check cache
  const cacheKey = key + email
  let cachedData = await getCache<RegistrationRecord>(cacheKey) || { email: email, count: 0, reg: "", hash: "" };


  if (cachedData && cachedData.count >= 10) { return { code: 1, messages: 'Daily email limit reached. Please try again after 24 hours.' }}
  if (cachedData && cachedData.reg == 'existed') { return { code: 1, messages: 'This email is already registered. Please log in.' }}

  //check db by request nestJs server 
  const user = await http.get<any>('user/email/' + email)
  if (user.data) { cachedData.reg = 'existed'; return { code: 1, messages: 'This email is already registered. Please log in' }}

  //create hash
  cachedData.hash = await hash(email)

  //encode email

  const encodeEmail = await encodeData(email)

  //send mail
  let data = {
    subject: "Verify your email",
    from: '"Stratail" <your-email@gmail.com>',
    email: email,
    html: key = 'reg:' ? `<b>Welcome to Stratail!</b><p>Please click the link below to complete your registration:</p>
          <a href="http://127.0.0.1:3000/auth/register?key=${cachedData.hash}&code=${encodeEmail}">
          http://127.0.0.1:3000/auth/register?key=${cachedData.hash}&code=${encodeEmail}
          </a>`: ``
  }

  const result = await mail(data)

  if (result.code == 0) {
    //setCache
    const TTL_24H = 1000 * 60 * 60 * 24;
    cachedData.count = cachedData.count + 1
    await setCache(cacheKey, cachedData, TTL_24H)
    return { code: 0, messages: 'Successful sent valid mail to :', email: email }
  } else {
    return { code: 1, messages: 'Failed sent valid mail to :', email: email }
  }
}