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
  Alert,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  UploadOutlined,
  LoadingOutlined,
  PlusOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";
import { endOfRegistration } from "../services/user_api";
import subjectsByGrade, { SubjectsData } from "../components/SubjectByGrade";
import allQuestions, { QuestionItem } from "../components/QuestionBank";
import type { UploadFile, UploadProps, RcFile } from "antd/es/upload/interface";
import { useUser } from "../context/UserContext";

const { Step } = Steps;
const { Title, Text } = Typography;
const { Option } = Select;

interface FormValues {
  username?: string;
  parent_name?: string;
  grade?: string;
  imageUrl?: string;
  parent_phone?: string;
  parent_email?: string;
  currentSubjects?: string[];
  dateOfBirth?: string;
  [key: string]: any;
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
  const { user, setUser } = useUser();

  // Image upload state
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "success" | "error" | "none"
  >("none");
  const [uploadMessage, setUploadMessage] = useState<string>("");

  // Load saved data on component mount
  useEffect(() => {
    const savedGrade = localStorage.getItem("grade") || "";
    const savedImageUrl = localStorage.getItem("imageUrl") || "";

    form.setFieldsValue({
      username: localStorage.getItem("username") || "",
      parent_name: localStorage.getItem("parent_name") || "",
      parent_email: localStorage.getItem("parent_email") || "",
      parent_phone: localStorage.getItem("parent_phone") || "",
      dateOfBirth: localStorage.getItem("dateOfBirth") || "",
      grade: savedGrade || undefined,
    });

    // Load saved image
    if (savedImageUrl) {
      setImageUrl(savedImageUrl);
      setUploadStatus("success");
      setUploadMessage("התמונה נטענה בהצלחה");
    }

    // Set selected grade
    if (savedGrade) {
      setSelectedGrade(savedGrade);
    }
  }, [form]);

  // Update questions based on grade and subjects
  useEffect(() => {
    if (!selectedGrade) return;

    const relevantQuestions = allQuestions.filter((question) => {
      // Filter questions based on grade and selected subjects
      const gradeInRange =
        (!question.minGrade || selectedGrade >= question.minGrade) &&
        (!question.maxGrade || selectedGrade <= question.maxGrade);

      if (!question.forSubjects || selectedSubjects.length === 0)
        return gradeInRange;

      return (
        gradeInRange &&
        question.forSubjects.some((subject) =>
          selectedSubjects.includes(subject)
        )
      );
    });

    const generalQuestions = relevantQuestions.filter(
      (q) => !q.minGrade && !q.maxGrade
    );
    const specificQuestions = relevantQuestions.filter(
      (q) => q.minGrade || q.maxGrade
    );

    const groupedQuestions: QuestionItem[][] = [];
    for (let i = 0; i < specificQuestions.length; i += 3) {
      groupedQuestions.push(specificQuestions.slice(i, i + 3));
    }

    if (generalQuestions.length > 0) {
      groupedQuestions.push(generalQuestions);
    }

    setQuestionPool(groupedQuestions);
  }, [selectedGrade, selectedSubjects]);

  // Add this function to compress/resize images before upload
  const compressImage = (file: RcFile): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      // Max dimensions for profile picture
      const maxWidth = 300;
      const maxHeight = 300;

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          // Create canvas and draw resized image
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to blob with reduced quality
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to compress image"));
              }
            },
            file.type,
            0.7 // 70% quality - adjust as needed
          );
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  // Update the beforeUpload function to include compression
  const beforeUpload = async (file: RcFile) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("ניתן להעלות רק קבצי JPG/PNG!");
      setUploadStatus("error");
      setUploadMessage("השגיאה: ניתן להעלות רק קבצי JPG/PNG");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("גודל התמונה חייב להיות קטן מ-2MB!");
      setUploadStatus("error");
      setUploadMessage("השגיאה: גודל התמונה חייב להיות קטן מ-2MB");
      return false;
    }
    return isJpgOrPng && isLt2M;
  };

  // Update the handleImageChange function
  const handleImageChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      setUploadStatus("none");
      setUploadMessage("");
      return;
    }

    if (info.file.status === "done" || info.file.status === "error") {
      if (info.file.originFileObj) {
        // Compress the image first
        compressImage(info.file.originFileObj)
          .then((blob) => {
            // Convert compressed blob to data URL
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = reader.result as string;
              // Store compressed image URL (with reasonable size)
              setImageUrl(dataUrl);
              localStorage.setItem("imageUrl", dataUrl);
              setLoading(false);
              setUploadStatus("success");
              setUploadMessage("התמונה הועלתה בהצלחה");
              message.success("התמונה הועלתה בהצלחה!");
            };
            reader.readAsDataURL(blob);
          })
          .catch((error) => {
            console.error("Image compression failed:", error);
            setLoading(false);
            setUploadStatus("error");
            setUploadMessage("אירעה שגיאה בעיבוד התמונה");
            message.error("אירעה שגיאה בעיבוד התמונה");
          });
      } else {
        setLoading(false);
        setUploadStatus("error");
        setUploadMessage("לא ניתן לגשת לקובץ התמונה");
        message.error("לא ניתן לגשת לקובץ התמונה");
      }
    }
  };
  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>העלה תמונה</div>
    </div>
  );

  // Generate steps based on question pool
  const steps = [
    { title: "פרטים אישיים", key: "step0" },
    ...questionPool.map((_, index) => ({
      title: `שאלות ${index * 3 + 1}-${Math.min(
        index * 3 + 3,
        questionPool.length * 3
      )}`,
      key: `step${index + 1}`,
    })),
  ];

  // Grade and subjects change handlers
  const handleGradeChange = (value: string) => {
    setSelectedGrade(value);
    form.setFieldsValue({ currentSubjects: [] });
    setSelectedSubjects([]);
  };

  const handleSubjectsChange = (values: string[]) => {
    setSelectedSubjects(values);
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();

      if (currentStep === 0) {
        if (values.grade) {
          setSelectedGrade(values.grade);
        }
        if (values.currentSubjects) {
          setSelectedSubjects(values.currentSubjects);
        }
      } else {
        const stepQuestions = questionPool[currentStep - 1];
        const stepFields = stepQuestions.map((q) => q.name);

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

  // const handleFinish = async () => {
  //   try {
  //     // Retrieve all values, including from preserved (unmounted) fields
  //     const values = form.getFieldsValue(true);
  //     console.log("All Form Values:", values);

  //     // Normalize field names
  //     const normalizedValues = {
  //       parent_name:
  //         values.parent_name || values.parentName || values.parentname || "",
  //       parent_email:
  //         values.parent_email || values.parentEmail || values.parentemail || "",
  //       parent_phone:
  //         values.parent_phone || values.parentPhone || values.parentphone || "",
  //     };

  //     console.log("Normalized Values:", normalizedValues);

  //     // Validate that we have all required parent information
  //     if (!normalizedValues.parent_name) {
  //       message.error("אנא הזן את שם ההורה");
  //       return;
  //     }
  //     if (!normalizedValues.parent_email) {
  //       message.error("אנא הזן את אימייל ההורה");
  //       return;
  //     }
  //     if (!normalizedValues.parent_phone) {
  //       message.error("אנא הזן את מספר טלפון ההורה");
  //       return;
  //     }

  //     // Calculate final score and level
  //     if (currentStep > 0 && questionPool.length > 0) {
  //       const finalStepQuestions = questionPool[currentStep - 1];
  //       const finalStepFields = finalStepQuestions.map((q) => q.name);

  //       const finalStepScore = Object.entries(values)
  //         .filter(([key]) => finalStepFields.includes(key))
  //         .map(([, value]) => value as number)
  //         .reduce((acc, val) => acc + val, 0);

  //       const finalScore = totalScore + finalStepScore;

  //       const totalQuestions = questionPool.reduce(
  //         (acc, group) => acc + group.length,
  //         0
  //       );
  //       const avgScore = finalScore / (totalQuestions || 1);

  //       // Level and rank calculation
  //       let calculatedLevel = "";
  //       let mappedRank = "1";

  //       if (avgScore <= 2) {
  //         calculatedLevel = " 🪱 תולעת חכמה ";
  //         mappedRank = "1";
  //       } else if (avgScore <= 3.5) {
  //         calculatedLevel = "🐶 כלב מתמטי";
  //         mappedRank = "2";
  //       } else {
  //         calculatedLevel = "🐯 נמר מספרים ";
  //         mappedRank = "3";
  //       }

  //       const userData = {
  //         userId: localStorage.getItem("userId") || "",
  //         parent_name: normalizedValues.parent_name,
  //         parent_email: normalizedValues.parent_email,
  //         parent_phone: normalizedValues.parent_phone,
  //         grade: values.grade || localStorage.getItem("grade") || "",
  //         DateOfBirth:
  //           values.dateOfBirth || localStorage.getItem("dateOfBirth") || "",
  //         rank: mappedRank,
  //         imageUrl: imageUrl || localStorage.getItem("imageUrl") || "",
  //       };

  //       console.log("Prepared User Data:", userData);

  //       // Send update to server
  //       await endOfRegistration(userData);

  //       // Update localStorage
  //       Object.entries(userData).forEach(([key, value]) => {
  //         if (value !== undefined && key !== "userId") {
  //           localStorage.setItem(key, String(value));
  //         }
  //       });

  //       navigate("/home");

  //       // Set state for displaying results
  //       setAverageScore(avgScore);
  //       setLevel(calculatedLevel);
  //     }
  //   } catch (error) {
  //     console.error("Failed to submit quiz:", error);

  //     if (error instanceof Error) {
  //       console.error("Validation error details:", error.message);

  //       if ("errorFields" in error) {
  //         console.error("Error fields:", (error as any).errorFields);
  //       }
  //     }
  //   }
  // };

  const handleFinish = async () => {
    try {
      const values = form.getFieldsValue(true);

      const normalizedValues = {
        parent_name: values.parent_name || "",
        parent_email: values.parent_email || "",
        parent_phone: values.parent_phone || "",
      };

      if (
        !normalizedValues.parent_name ||
        !normalizedValues.parent_email ||
        !normalizedValues.parent_phone
      ) {
        message.error("אנא הזן את כל פרטי ההורה הנדרשים");
        return;
      }

      const finalStepQuestions = questionPool[currentStep - 1];
      const finalStepFields = finalStepQuestions.map((q) => q.name);
      const finalStepScore = Object.entries(values)
        .filter(([key]) => finalStepFields.includes(key))
        .map(([, value]) => value as number)
        .reduce((acc, val) => acc + val, 0);

      const finalScore = totalScore + finalStepScore;
      const totalQuestions = questionPool.reduce(
        (acc, group) => acc + group.length,
        0
      );
      const avgScore = finalScore / (totalQuestions || 1);

      let mappedRank = "1";
      if (avgScore <= 2) mappedRank = "1";
      else if (avgScore <= 3.5) mappedRank = "2";
      else mappedRank = "3";

      const userDataToSend = {
        userId: user?._id,
        parent_name: normalizedValues.parent_name,
        parent_email: normalizedValues.parent_email,
        parent_phone: normalizedValues.parent_phone,
        grade: values.grade,
        DateOfBirth: values.dateOfBirth,
        rank: mappedRank,
        imageUrl: imageUrl || "",
      };

      const updatedUser = await endOfRegistration(userDataToSend);

      setUser((prevUser) => ({
        ...prevUser!,
        ...updatedUser,
      }));

      setAverageScore(avgScore);
      setLevel(mappedRank);
      message.success("ההרשמה הושלמה בהצלחה!");
      navigate("/home");
    } catch (error) {
      message.error("השלמת ההרשמה נכשלה");
      console.error(error);
    }
  };

  // Image uploader component
  const renderImageUploader = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "10px",
      }}
    >
      <Upload
        name="avatar"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleImageChange}
        customRequest={({ file, onSuccess }) => {
          // Mock a successful upload after a brief delay
          setTimeout(() => {
            onSuccess && onSuccess("ok");
          }, 500);
        }}
      >
        {imageUrl ? (
          <Badge
            count={
              <CheckCircleFilled
                style={{ color: "#52c41a", fontSize: "22px" }}
              />
            }
            offset={[-8, 8]}
          >
            <img
              src={imageUrl}
              alt="avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Badge>
        ) : (
          uploadButton
        )}
      </Upload>
      {uploadStatus === "success" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            color: "#52c41a",
          }}
        >
          <CheckCircleFilled />
          <span>{uploadMessage}</span>
        </div>
      )}

      {uploadStatus === "error" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            color: "#f5222d",
          }}
        >
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
            setUploadStatus("none");
            setUploadMessage("");
          }}
          style={{ marginTop: "5px" }}
        >
          הסר תמונה
        </Button>
      )}
    </div>
  );

  const personalInfoFields = [
    {
      label: "שם התלמיד",
      name: "username",
      inputType: <Input placeholder="הכנס את שם התלמיד" />,
      required: true,
    },
    {
      label: "שם ההורה",
      name: "parent_name",
      inputType: <Input placeholder="הכנס את שם ההורה" />,
      required: true,
    },
    {
      label: "תמונת פרופיל",
      name: "imageUrl",
      inputType: renderImageUploader(),
      required: false,
    },
    {
      label: "כיתה",
      name: "grade",
      inputType: (
        <Select
          placeholder="בחר כיתה"
          onChange={handleGradeChange}
          style={{ width: "100%" }}
        >
          {Object.keys(subjectsByGrade).map((grade) => (
            <Option key={grade} value={grade}>{`כיתה ${grade}`}</Option>
          ))}
        </Select>
      ),
      required: true,
    },
    {
      label: "תאריך לידה",
      name: "dateOfBirth",
      inputType: (
        <DatePicker placeholder="הכנס תאריך לידה" style={{ width: "100%" }} />
      ),
      required: true,
    },
    {
      label: "נושאים נלמדים כעת",
      name: "currentSubjects",
      inputType: (
        <Select
          mode="multiple"
          style={{ width: "100%" }}
          placeholder="בחר נושאים"
          onChange={handleSubjectsChange}
          disabled={!selectedGrade}
        >
          {selectedGrade &&
            subjectsByGrade[selectedGrade as keyof SubjectsData]?.map(
              (subject) => (
                <Option key={subject} value={subject}>
                  {subject}
                </Option>
              )
            )}
        </Select>
      ),
      required: false,
    },
    {
      label: "מספר טלפון של הורה",
      name: "parent_phone",
      inputType: <Input placeholder="הכנס מספר טלפון" />,
      required: true,
    },
    {
      label: "אימייל של הורה",
      name: "parent_email",
      inputType: <Input placeholder="הכנס אימייל" type="email" />,
      required: true,
    },
  ];

  // Render fields with preserve attribute to ensure their values persist across steps
  const renderQuestions = () => {
    if (currentStep === 0) {
      return personalInfoFields.map((question, index) => (
        <Form.Item
          key={index}
          name={question.name}
          label={question.label}
          preserve
          rules={[
            { required: question.name !== "imageUrl", message: "שדה זה חובה" },
          ]}
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
        </div>
      )}
    </Space>
  );
};

export default QuizPage;