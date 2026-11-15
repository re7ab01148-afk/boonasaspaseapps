export interface ReportInput {
  title: string;
  person: string;
  subtitle: string;
  vitals: { label: string; value: string; status: string }[];
  alerts: { when: string; severity: string; title: string; value: string; action: string; status: string }[];
  note: string;
}

/** Builds and downloads a one-file PDF health report in the browser. */
export async function downloadHealthReport(r: ReportInput) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  let y = 44;
  const ensure = (h: number) => {
    if (y + h > H - 44) {
      doc.addPage();
      y = 44;
    }
  };
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 86, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("BOO", 44, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(r.title, 44, 64);
  doc.text(new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC", W - 44, 64, { align: "right" });
  y = 120;
  doc.setTextColor(20, 24, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(r.person, 44, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 110, 130);
  doc.text(r.subtitle, 44, y);
  y += 28;

  const section = (t: string) => {
    ensure(40);
    doc.setTextColor(37, 99, 235);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(t.toUpperCase(), 44, y);
    y += 8;
    doc.setDrawColor(220, 226, 240);
    doc.line(44, y, W - 44, y);
    y += 16;
  };
  const tone = (s: string): [number, number, number] =>
    /crit/i.test(s) ? [220, 38, 38] : /warn|watch/i.test(s) ? [202, 138, 4] : /info/i.test(s) ? [37, 99, 235] : [22, 163, 74];

  section("Latest vitals");
  doc.setFontSize(10);
  for (const v of r.vitals) {
    ensure(18);
    doc.setTextColor(20, 24, 40);
    doc.setFont("helvetica", "normal");
    doc.text(v.label, 44, y);
    doc.setFont("helvetica", "bold");
    doc.text(v.value, 264, y);
    doc.setTextColor(...tone(v.status));
    doc.text(v.status, W - 44, y, { align: "right" });
    y += 18;
  }
  y += 10;
  section(`Alerts (${r.alerts.length})`);
  if (r.alerts.length === 0) {
    doc.setTextColor(100, 110, 130);
    doc.setFont("helvetica", "normal");
    doc.text("No alerts recorded.", 44, y);
    y += 18;
  }
  for (const a of r.alerts) {
    const lines = doc.splitTextToSize(`Action: ${a.action}`, W - 88 - 12);
    ensure(36 + lines.length * 12);
    doc.setTextColor(...tone(a.severity));
    doc.setFont("helvetica", "bold");
    doc.text(`${a.severity.toUpperCase()}  ${a.title} · ${a.value}`, 44, y);
    doc.setTextColor(100, 110, 130);
    doc.setFont("helvetica", "normal");
    doc.text(`${a.when} · ${a.status}`, W - 44, y, { align: "right" });
    y += 14;
    doc.setTextColor(20, 24, 40);
    doc.text(lines, 56, y);
    y += lines.length * 12 + 10;
  }
  ensure(30);
  y += 14;
  doc.setFontSize(8);
  doc.setTextColor(140, 148, 165);
  doc.text(doc.splitTextToSize(r.note, W - 88), 44, y);
  doc.save(`boo-health-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
