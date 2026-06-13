import Groq from 'groq-sdk';

export class GroqService {
    private groq: Groq;

    constructor() {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }

    async detectIntent(message: string): Promise<any> {
        const systemPrompt = `
        You are an AI intent detector for an HRMS system. 
        Your job is to identify the user's intent and return a JSON object.
        
        Supported intents:
        1. total_employees (Count of all employees)
        2. employees_on_leave_today (Count/List of employees on leave today)
        3. employees_joined_this_month (Employees who joined in the current calendar month)
        4. employees_joined_last_30_days (Employees who joined in the last 30 days)
        5. present_employees_today (Attendance: Present today)
        6. absent_employees_today (Attendance: Absent today)
        7. pending_leave_requests (Count of leave requests with status 'Pending')
        8. department_employee_count (Requires department name)
        9. employee_search_by_name (Requires name)
        10. employee_search_by_skill (Requires skill)

        Rules:
        - Return ONLY JSON.
        - If intent is 'department_employee_count', include "departmentName".
        - If intent is 'employee_search_by_name', include "searchTerm".
        - If intent is 'employee_search_by_skill', include "skill".
        - If no intent matches, return {"intent": "unknown"}.

        JSON Format:
        {"intent": "intent_name", "params": {...}}
        `;

        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                model: 'llama-3.3-70b-versatile',
                response_format: { type: 'json_object' }
            });

            return JSON.parse(completion.choices[0]?.message?.content || '{}');
        } catch (error) {
            console.error("Groq Intent Detection Error:", error);
            throw new Error("Failed to detect intent");
        }
    }
}
