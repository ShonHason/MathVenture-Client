import React, { useState } from "react";
import {
  Steps,
  Form,
  Input,
  Button,
  Checkbox,
  Radio,
  Typography,
  Space,
} from "antd";
import { useNavigate } from "react-router-dom";

const { Step } = Steps;
const { Title } = Typography;

interface FormValues {
  name?: string;
  grade?: string[];
  additionSubtraction?: number;
  multiplicationDivision?: number;
  multiplicationTable?: number;
  wordProblems?: number;
  shapesKnowledge?: number;
  newTopic?: number;
  homework?: number;
}

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<FormValues>();
  const [totalScore, setTotalScore] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  const steps = [
    { title: "שאלות 1-3", key: "step1" },
    { title: "שאלות 4-7", key: "step2" },
    { title: "שאלות 8-11", key: "step3" },
  ];

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      // Calculate step score
      const stepScore = Object.values(values)
        .filter((val): val is number => typeof val === "number")
        .reduce((acc, val) => acc + val, 0);
      setTotalScore((prev) => prev + stepScore);
      form.resetFields();
      setCurrentStep((prev) => prev + 1);
    } catch {}
  };

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      // Calculate final step score
      const finalStepScore = Object.values(values)
        .filter((val): val is number => typeof val === "number")
        .reduce((acc, val) => acc + val, 0);
      const finalScore = totalScore + finalStepScore;
      const avgScore = finalScore / 10;

      let calculatedLevel = "";
      if (avgScore <= 2) calculatedLevel = " 🪱 תולעת חכמה ";
      else if (avgScore <= 3.5) calculatedLevel = "🐶 כלב מתמטי";
      else calculatedLevel = "🐯 נמר מספרים ";

      setAverageScore(avgScore);
      setLevel(calculatedLevel);
    } catch {}
  };

  const navigateToPlan = () => {
    navigate("/plan");
  };

  const questionSets = [
    [
      {
        label: "מה שם התלמיד?",
        name: "name",
        inputType: <Input placeholder="הכנס שם" />,
      },
      {
        label: "איזה כיתה התלמיד?",
        name: "grade",
        inputType: (
          <Checkbox.Group
            options={["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"]}
          />
        ),
      },
      {
        label: "איך התלמיד מסתדר בחיבור וחיסור?",
        name: "additionSubtraction",
        inputType: (
          <Radio.Group>
            {[1, 2, 3, 4, 5].map((num) => (
              <Radio value={num} key={num}>
                {num}
              </Radio>
            ))}
          </Radio.Group>
        ),
      },
    ],
    [
      {
        label: "איך התלמיד בכפל וחילוק?",
        name: "multiplicationDivision",
        inputType: (
          <Radio.Group>
            {[1, 2, 3, 4, 5].map((num) => (
              <Radio value={num} key={num}>
                {num}
              </Radio>
            ))}
          </Radio.Group>
        ),
      },
      {
        label: "מה היכולת של התלמיד בלוח הכפל?",
        name: "multiplicationTable",
        inputType: (
          <Radio.Group>
            {[1, 2, 3, 4, 5].map((num) => (
              <Radio value={num} key={num}>
                {num}
              </Radio>
            ))}
          </Radio.Group>
        ),
      },
      {
        label: "איך הילד מתמודד עם בעיות מילוליות במתמטיקה?",
        name: "wordProblems",
        inputType: (
          <Radio.Group>
            {[
              { label: "לא טוב", value: 1 },
              { label: "בסדר", value: 3 },
              { label: "מעולה", value: 5 },
            ].map((option) => (
              <Radio value={option.value} key={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        ),
      },
    ],
    [
      {
        label: "האם הילד מכיר שמות של צורות גיאומטריות פשוטות?",
        name: "shapesKnowledge",
        inputType: (
          <Radio.Group>
            {[
              { label: "לא טוב", value: 1 },
              { label: "בסדר", value: 3 },
              { label: "מעולה", value: 5 },
            ].map((option) => (
              <Radio value={option.value} key={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        ),
      },
      {
        label: "איך הילד מגיב כשצריך ללמוד נושא חדש במתמטיקה?",
        name: "newTopic",
        inputType: (
          <Radio.Group>
            {[
              { label: "לא טוב", value: 1 },
              { label: "בסדר", value: 3 },
              { label: "מעולה", value: 5 },
            ].map((option) => (
              <Radio value={option.value} key={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        ),
      },
      {
        label: "האם הילד מבצע שיעורי בית באופן עצמאי?",
        name: "homework",
        inputType: (
          <Radio.Group>
            {[
              { label: "לא טוב", value: 1 },
              { label: "בסדר", value: 3 },
              { label: "מעולה", value: 5 },
            ].map((option) => (
              <Radio value={option.value} key={option.value}>
                {option.label}
              </Radio>
            ))}
          </Radio.Group>
        ),
      },
    ],
  ];

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      {averageScore === null ? (
        <>
          <Title level={3} style={{ textAlign: "center" }}>
            שאלון לתלמיד
          </Title>
          <Steps current={currentStep}>
            {steps.map((step) => (
              <Step key={step.key} title={step.title} />
            ))}
          </Steps>
          <Form
            form={form}
            layout="vertical"
            style={{ maxWidth: "600px", margin: "auto", marginTop: "20px" }}
          >
            {questionSets[currentStep].map((question, index) => (
              <Form.Item
                key={index}
                name={question.name}
                label={question.label}
                rules={[{ required: true, message: "שדה זה חובה" }]}
              >
                {question.inputType}
              </Form.Item>
            ))}

            <Form.Item>
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={handleNext}>
                  הבא
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button type="primary" onClick={handleFinish}>
                  סיים
                </Button>
              )}
            </Form.Item>
          </Form>
        </>
      ) : (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <Title level={1}>:רמת התלמיד</Title>
          <Title level={1}>{level}</Title>

          <Button type="primary" onClick={navigateToPlan}>
            המשך לבחירת תוכנית
          </Button>
        </div>
      )}
    </Space>
  );
};

export default QuizPage;
