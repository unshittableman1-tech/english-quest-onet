export async function readChapter3Response(response) {
  const body = await response.text();
  let result;
  try {
    result = JSON.parse(body);
  } catch {
    throw new Error('ระบบภารกิจยังไม่พร้อมใช้งาน กรุณากดลองใหม่สักครู่');
  }
  if (!response.ok || !result?.ok) {
    throw new Error(response.status === 404 || response.status >= 500
      ? 'ระบบภารกิจยังไม่พร้อมใช้งาน กรุณากดลองใหม่สักครู่'
      : 'เปิดหรือบันทึกภารกิจไม่ได้ กรุณาตรวจสิทธิ์และลองอีกครั้ง');
  }
  return result;
}
