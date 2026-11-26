import type { Request, Response } from "express";
import * as rsvpRepo from "../repository/rsvp.js";
import * as orderRepo from "../repository/order.js";
import type { Attendance } from "../models/rsvp.js";

// GET /api/invitations/:slug/rsvps
export async function daftarRsvps(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);
    const invitation = await orderRepo.cariInvitationBySlug(slug);
    if (!invitation) {
      res.status(404).json({ error: "Undangan tidak ditemukan" });
      return;
    }

    const rsvps = await rsvpRepo.ambilRsvpsByInvitationId(invitation.id);
    res.json(rsvps);
  } catch (err) {
    res.status(500).json({ error: "Gagal memuat ucapan & RSVP" });
  }
}

// POST /api/invitations/:slug/rsvps
export async function kirimRsvp(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);
    const invitation = await orderRepo.cariInvitationBySlug(slug);
    if (!invitation) {
      res.status(404).json({ error: "Undangan tidak ditemukan" });
      return;
    }

    if (invitation.status !== "active" || new Date() > new Date(invitation.expires_at)) {
      res.status(403).json({ error: "Undangan ini belum aktif atau masa berlakunya telah berakhir." });
      return;
    }

    const { guest_name, attendance, pax, message } = req.body ?? {};

    if (!guest_name || !message) {
      res.status(400).json({ error: "Nama tamu dan ucapan doa wajib diisi" });
      return;
    }

    const cleanName = String(guest_name).trim();
    const cleanMessage = String(message).trim();
    if (!cleanName || cleanName.length > 100) {
      res.status(400).json({ error: "Nama tamu wajib diisi (maksimal 100 karakter)" });
      return;
    }
    if (!cleanMessage || cleanMessage.length > 500) {
      res.status(400).json({ error: "Ucapan doa wajib diisi (maksimal 500 karakter)" });
      return;
    }

    const att: Attendance =
      attendance === "tidak_hadir" || attendance === "ragu" ? attendance : "hadir";
    const parsedPax = Number.isFinite(Number(pax)) ? Math.floor(Number(pax)) : 1;
    const cleanPax = att === "hadir" ? Math.min(Math.max(parsedPax, 1), 20) : 0;

    const rsvp = await rsvpRepo.tambahRsvp(invitation.id, {
      guest_name: cleanName,
      attendance: att,
      pax: cleanPax,
      message: cleanMessage,
    });

    res.status(201).json({
      success: true,
      message: "Terima kasih atas konfirmasi dan ucapan doa restu Anda!",
      rsvp,
    });
  } catch (err) {
    console.error("Submit RSVP error:", err);
    res.status(500).json({ error: "Gagal mengirimkan ucapan RSVP" });
  }
}

