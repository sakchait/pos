// Services/AiRecommendationService.cs

namespace Pos.Infrastructure.Services;
public class AiRecommendationService
{
    public async Task<string> GetPersonalizedRecommendationAsync(Guid memberId, List<Guid> currentCartProductIds)
    {
        // 1. ดึงประวัติการซื้อย้อนหลังของสมาชิกคนนี้
        // 2. ส่ง Prompt ไปหา AI Model (เช่น Gemini / Azure OpenAI)
        string prompt = $@"
        คุณคือ AI ผู้ช่วยแคชเชียร์ POS
        ข้อมูลสมาชิก: ประวัติชอบซื้อ 'กาแฟลาเต้หวานน้อย' และ 'แซนด์วิชแฮมชีส'
        สินค้าในตะกร้าปัจจุบัน: 'กาแฟลาเต้ 1 แก้ว'
        
        คำสั่ง: แนะนำสินค้า 1 รายการที่ควรเชียร์ขายเพิ่ม พร้อมสคริปต์สั้นๆ ให้แคชเชียร์พูดไม่เกิน 1 ประโยค
        ";

        // Call AI API...
        return "รับแซนด์วิชแฮมชีส อุ่นร้อนๆ ทานคู่กับลาเต้เพิ่มไหมคะ วันนี้สมาชิกได้ส่วนลดพิเศษ 10 บาทค่ะ!";
    }
}