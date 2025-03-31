// src/pages/QuizPage.tsx
import React, { useState, useEffect } from "react";
import {
  Steps,
  Form,
  Input,
  Button,
  Radio,
  Typography,
  Space,
  Select,
  Card,
  DatePicker,
  Upload,
  message,
  Badge,
  Tooltip,
  Alert
} from "antd";
import { useNavigate } from "react-router-dom";
import { 
  UploadOutlined, 
  LoadingOutlined, 
  PlusOutlined,
  CheckCircleFilled,
  CloseCircleFilled
} from '@ant-design/icons';
import { updateUser } from "../services/user_api";
import subjectsByGrade, { SubjectsData } from "../components/SubjectByGrade";
import allQuestions, { QuestionItem } from "../components/QuestionBank";
import type { UploadFile, UploadProps, RcFile } from 'antd/es/upload/interface';

const { Step } = Steps;
const { Title, Text } = Typography;
const { Option } = Select;

interface FormValues {
  username?: string; // שם התלמיד
  parent_name?: string; // שם ההורה
  grade?: string;
  imageUrl?: string;
  parent_phone?: string;
  parent_email?: string;
  currentSubjects?: string[];
  dateOfBirth?: string;
  [key: string]: any; // For dynamic questions
}

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm<FormValues>();
  const [totalScore, setTotalScore] = useState<number>(0);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [questionPool, setQuestionPool] = useState<QuestionItem[][]>([]);
  let calculatedLevel = ""; // Declare calculatedLevel in the outer scope
  
  // משתני מצב להעלאת תמונה
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'success' | 'error' | 'none'>('none');
  const [uploadMessage, setUploadMessage] = useState<string>('');

  // עדכון הערכים מה-localStorage בטעינת הקומפוננטה
  useEffect(() => {
    const savedGrade = localStorage.getItem("grade") || "";
    const savedImageUrl = localStorage.getItem("imageUrl") || "";
    
    form.setFieldsValue({
      username: localStorage.getItem("username") || "", // שם התלמיד
      parent_name: localStorage.getItem("parent_name") || "", // שם ההורה
      parent_email: localStorage.getItem("parent_email") || "",
      parent_phone: localStorage.getItem("parent_phone") || "",
      dateOfBirth: localStorage.getItem("dateOfBirth") || "",
      grade: savedGrade || undefined
    });
    
    // אם יש תמונה שמורה, נציג אותה
    if (savedImageUrl) {
      setImageUrl(savedImageUrl);
      setUploadStatus('success');
      setUploadMessage('התמונה נטענה בהצלחה');
    }
    
    // אם יש כיתה שמורה, אנחנו מגדירים אותה כברירת מחדל
    if (savedGrade) {
      setSelectedGrade(savedGrade);
    }
  }, [form]);

  // עדכון השאלות בהתאם לכיתה ולנושאים שנבחרו
  useEffect(() => {
    if (!selectedGrade) return;
    
    // סינון שאלות רלוונטיות לפי כיתה ונושאים
    const relevantQuestions = allQuestions.filter(question => {
      // אם אין הגבלת כיתה - מתאים לכולם
      if (!question.minGrade && !question.maxGrade) return true;
      
      // בדיקה אם הכיתה בטווח המתאים
      const gradeInRange = (!question.minGrade || selectedGrade >= question.minGrade) && 
                         (!question.maxGrade || selectedGrade <= question.maxGrade);
      
      // אם אין הגבלת נושאים או אם לא נבחרו נושאים ספציפיים, מחזירים לפי הטווח גיל בלבד
      if (!question.forSubjects || selectedSubjects.length === 0) return gradeInRange;
      
      // אחרת בודקים אם יש חפיפה בין הנושאים הנבחרים לנושאים של השאלה
      return gradeInRange && question.forSubjects.some(subject => selectedSubjects.includes(subject));
    });
    
    // חלוקת השאלות לקבוצות של 2-3 לכל שלב
    const generalQuestions = relevantQuestions.filter(q => !q.minGrade && !q.maxGrade);
    const specificQuestions = relevantQuestions.filter(q => q.minGrade || q.maxGrade);
    
    // חלוקה לקבוצות של 3 שאלות לכל שלב
    const groupedQuestions: QuestionItem[][] = [];
    for (let i = 0; i < specificQuestions.length; i += 3) {
      groupedQuestions.push(specificQuestions.slice(i, i + 3));
    }
    
    // הוספת השאלות הכלליות בקבוצה נפרדת
    if (generalQuestions.length > 0) {
      groupedQuestions.push(generalQuestions);
    }
    
    setQuestionPool(groupedQuestions);
  }, [selectedGrade, selectedSubjects]);

  // טיפול בהעלאת תמונה
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('ניתן להעלות רק קבצי JPG/PNG!');
      setUploadStatus('error');
      setUploadMessage('השגיאה: ניתן להעלות רק קבצי JPG/PNG');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('גודל התמונה חייב להיות קטן מ-2MB!');
      setUploadStatus('error');
      setUploadMessage('השגיאה: גודל התמונה חייב להיות קטן מ-2MB');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleImageChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      setUploadStatus('none');
      setUploadMessage('');
      return;
    }
    if (info.file.status === 'done') {
      // הדמיית העלאת תמונה לשרת - במציאות צריך לטפל בתגובת השרת
      try {
        const imageUrl = info.file.response?.url || URL.createObjectURL(info.file.originFileObj as Blob);
        setImageUrl(imageUrl);
        localStorage.setItem("imageUrl", imageUrl);
        setLoading(false);
        setUploadStatus('success');
        setUploadMessage('התמונה הועלתה בהצלחה');
        message.success('התמונה הועלתה בהצלחה!');
      } catch (error) {
        setLoading(false);
        setUploadStatus('error');
        setUploadMessage('אירעה שגיאה בהעלאת התמונה');
        message.error('אירעה שגיאה בהעלאת התמונה');
      }
    } else if (info.file.status === 'error') {
      setLoading(false);
      setUploadStatus('error');
      setUploadMessage('שגיאה: לא ניתן להעלות את התמונה');
      message.error('שגיאה: לא ניתן להעלות את התמונה');
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>העלה תמונה</div>
    </div>
  );

  const steps = [
    { title: "פרטים אישיים", key: "step0" },
    ...(questionPool.map((_, index) => ({ 
      title: `שאלות ${index * 3 + 1}-${Math.min(index * 3 + 3, questionPool.length * 3)}`,
      key: `step${index + 1}` 
    })))
  ];

  // טיפול בשינוי בחירת כיתה
  const handleGradeChange = (value: string) => {
    setSelectedGrade(value);
    
    // עדכון אפשרויות הנושאים בהתאם לכיתה
    form.setFieldsValue({ currentSubjects: [] });
    setSelectedSubjects([]);
  };

  // טיפול בשינוי בחירת נושאים
  const handleSubjectsChange = (values: string[]) => {
    setSelectedSubjects(values);
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      
      // אם זה השלב הראשון, מעדכנים כיתה ונושאים
      if (currentStep === 0) {
        if (values.grade) {
          setSelectedGrade(values.grade);
        }
        if (values.currentSubjects) {
          setSelectedSubjects(values.currentSubjects);
        }
      } else {
        // חישוב ניקוד השלב
        const stepQuestions = questionPool[currentStep - 1];
        const stepFields = stepQuestions.map(q => q.name);
        
        const stepScore = Object.entries(values)
          .filter(([key]) => stepFields.includes(key))
          .map(([, value]) => value as number)
          .reduce((acc, val) => acc + val, 0);
        
        setTotalScore((prev) => prev + stepScore);
      }
      
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      
      // חישוב ניקוד שלב סופי
      if (currentStep > 0 && questionPool.length > 0) {
        const finalStepQuestions = questionPool[currentStep - 1];
        const finalStepFields = finalStepQuestions.map(q => q.name);
        
        const finalStepScore = Object.entries(values)
          .filter(([key]) => finalStepFields.includes(key))
          .map(([, value]) => value as number)
          .reduce((acc, val) => acc + val, 0);
        
        const finalScore = totalScore + finalStepScore;
        
        // חישוב ממוצע - מתחשב במספר השאלות שבאמת נשאלו
        const totalQuestions = questionPool.reduce((acc, group) => acc + group.length, 0);
        const avgScore = finalScore / (totalQuestions || 1);
        
        if (avgScore <= 2) calculatedLevel = " 🪱 תולעת חכמה ";
        else if (avgScore <= 3.5) calculatedLevel = "🐶 כלב מתמטי";
        else calculatedLevel = "🐯 נמר מספרים ";

        setAverageScore(avgScore);
        setLevel(calculatedLevel);
      }
      
      // מעדכנים את localStorage עם הנתונים החדשים
      if (values.username) localStorage.setItem("username", values.username);
      if (values.parent_name) localStorage.setItem("parent_name", values.parent_name);
      if (values.grade) localStorage.setItem("grade", values.grade);
      if (values.parent_email) localStorage.setItem("parent_email", values.parent_email);
      if (values.parent_phone) localStorage.setItem("parent_phone", values.parent_phone);
      if (values.dateOfBirth) localStorage.setItem("dateOfBirth", values.dateOfBirth);
      if (values.currentSubjects) localStorage.setItem("currentSubjects", JSON.stringify(values.currentSubjects));
      
      // שליחת העדכון לשרת
      await updateUser({
        userId: localStorage.getItem("userId") || "",
        parent_name: values.parent_name || localStorage.getItem("parent_name") || "",
        parent_email: values.parent_email || localStorage.getItem("parent_email") || "",
        parent_phone: values.parent_phone || localStorage.getItem("parent_phone") || "",
        grade: values.grade || localStorage.getItem("grade") || "",
        DateOfBirth: values.dateOfBirth || localStorage.getItem("dateOfBirth") || "",
        rank: calculatedLevel,
        imageUrl: imageUrl || localStorage.getItem("imageUrl") || ""
      });
      
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    }
  };
  
  const navigateToPlan = () => {
    navigate("/home");
  };

  // יצירת רכיב העלאת תמונה עם חיווי סטטוס
  const renderImageUploader = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76" // החלף עם כתובת האמיתית לשרת שלך
        beforeUpload={beforeUpload}
        onChange={handleImageChange}
      >
        {imageUrl ? (
          <Badge count={<CheckCircleFilled style={{ color: '#52c41a', fontSize: '22px' }} />} offset={[-8, 8]}>
            <img src={imageUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Badge>
        ) : uploadButton}
      </Upload>
      
      {uploadStatus === 'success' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#52c41a' }}>
          <CheckCircleFilled />
          <span>{uploadMessage}</span>
        </div>
      )}
      
      {uploadStatus === 'error' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#f5222d' }}>
          <CloseCircleFilled />
          <span>{uploadMessage}</span>
        </div>
      )}
      
      {imageUrl && (
        <Button 
          danger 
          size="small" 
          onClick={() => {
            setImageUrl(null);
            localStorage.removeItem("imageUrl");
            setUploadStatus('none');
            setUploadMessage('');
          }}
          style={{ marginTop: '5px' }}
        >
          הסר תמונה
        </Button>
      )}
    </div>
  );

  // הוספת שדות פרטים אישיים
  const personalInfoFields = [
    {
      label: "שם התלמיד",
      name: "username",
      inputType: <Input placeholder="הכנס את שם התלמיד" />,
    },
    {
      label: "שם ההורה",
      name: "parent_name",
      inputType: <Input placeholder="הכנס את שם ההורה" />,
    },
    {
      label: "תמונת פרופיל",
      name: "imageUrl",
      inputType: renderImageUploader(),
    },
    {
      label: "כיתה",
      name: "grade",
      inputType: (
        <Select
          placeholder="בחר כיתה"
          onChange={handleGradeChange}
          style={{ width: '100%' }}
        >
          {Object.keys(subjectsByGrade).map(grade => (
            <Option key={grade} value={grade}>{`כיתה ${grade}`}</Option>
          ))}
        </Select>
      ),
    },
    {
      label: "תאריך לידה",
      name: "dateOfBirth",
      inputType: <Input type="date" placeholder="הכנס תאריך לידה" />,
    },
    {
      label: "נושאים נלמדים כעת",
      name: "currentSubjects",
      inputType: (
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="בחר נושאים"
          onChange={handleSubjectsChange}
          disabled={!selectedGrade}
        >
          {selectedGrade && subjectsByGrade[selectedGrade as keyof SubjectsData]?.map(subject => (
            <Option key={subject} value={subject}>{subject}</Option>
          ))}
        </Select>
      ),
    },
    {
      label: "מספר טלפון של הורה",
      name: "parent_phone",
      inputType: <Input placeholder="הכנס מספר טלפון" />,
    },
    {
      label: "אימייל של הורה",
      name: "parent_email",
      inputType: <Input placeholder="הכנס אימייל" type="email" />,
    }
  ];

  // בחירת השאלות לפי השלב הנוכחי
  const renderQuestions = () => {
    if (currentStep === 0) {
      return personalInfoFields.map((question, index) => (
        <Form.Item
          key={index}
          name={question.name}
          label={question.label}
          rules={[{ required: question.name !== 'imageUrl', message: "שדה זה חובה" }]}
        >
          {question.inputType}
        </Form.Item>
      ));
    } else if (currentStep <= questionPool.length) {
      return questionPool[currentStep - 1].map((question, index) => (
        <Form.Item
          key={index}
          name={question.name}
          label={question.label}
          rules={[{ required: true, message: "שדה זה חובה" }]}
        >
          {question.inputType}
        </Form.Item>
      ));
    }
    return null;
  };

  return (
    <Space direction="vertical" style={{ width: "100%", padding: "10px 20px" }}>
      {averageScore === null ? (
        <>
          <Title level={3} style={{ textAlign: "center", margin: "10px 0" }}>
            שאלון לתלמיד
          </Title>
          
          {currentStep === 0 && (
            <Card style={{ marginBottom: "20px" }}>
              <Text>
                אנא מלא את הפרטים האישיים של התלמיד והנושאים אותם הוא לומד כעת. 
                השאלון יותאם באופן אישי בהתאם לכיתה ולתחומי העניין.
              </Text>
            </Card>
          )}
          
          <Steps current={currentStep} style={{ marginBottom: "15px" }}>
            {steps.map((step) => (
              <Step key={step.key} title={step.title} />
            ))}
          </Steps>
          
          <Form
            form={form}
            layout="vertical"
            style={{ maxWidth: "600px", margin: "0 auto", padding: "10px" }}
          >
            {renderQuestions()}

            <Form.Item style={{ marginTop: "10px", marginBottom: "10px" }}>
              {currentStep < Math.max(1, questionPool.length) && (
                <Button 
                  type="primary" 
                  onClick={handleNext}
                  disabled={currentStep === 0 && !selectedGrade}
                >
                  הבא
                </Button>
              )}
              {currentStep > 0 && currentStep === questionPool.length && (
                <Button type="primary" onClick={handleFinish}>
                  סיים
                </Button>
              )}
            </Form.Item>
          </Form>
        </>
      ) : (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <Title level={1}>:רמת התלמיד</Title>
          <Title level={1}>{level}</Title>

          <Button type="primary" onClick={navigateToPlan} style={{ marginTop: "20px" }}>
            המשך לבחירת תוכנית
          </Button>
        </div>
      )}
    </Space>
  );
};

export default QuizPage;