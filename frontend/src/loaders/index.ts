import db from "../helpers/db"

export async function safeLoader({ params }: any) {
    const safe = await db.getSafe(params.safeId)
    return { composeDBId: params.safeId, safe }
}