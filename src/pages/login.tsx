import React from "react";
import { Form, Input, Button, Tabs, Typography, Space, Radio, message } from "antd";
import { GoogleOutlined, AppleOutlined, FacebookOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import full_logo from "../images/full_logo.png";
import user_api from "../services/user_api";
import { useUser } from "../context/UserContext";

const { Title } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  gender: "female" | "male";
  confirmPassword: string;
}

const LoginRegistration: React.FC = () => {
  const [loginForm] = Form.useForm<LoginFormValues>();
  const [registerForm] = Form.useForm<RegisterFormValues>();
  const navigate = useNavigate();
  const { setUser } = useUser();

  const onLoginFinish = async (values: LoginFormValues) => {
    try {
      console.log("Login Attempt:", values);
      const data = await user_api.loginUser({
        email: values.email,
        password: values.password,
      });
      sessionStorage.setItem("accessToken", data.accessToken);
      sessionStorage.setItem("refreshToken", data.refreshToken);
      setUser({
        ...data,
        subjectsList: data.subjectsList || [],
      });
      sessionStorage.setItem("user", JSON.stringify(data));
      message.success("Login successful!");
      console.log("User data:");
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error);
      message.error("Login failed");
    }
  };

  const onRegisterFinish = async (values: RegisterFormValues) => {
    try {
      const { confirmPassword, ...registrationData } = values;
      console.log("Registration Attempt:", registrationData);
      const mappedData = {
        username: registrationData.username,
        email: registrationData.email,
        password: registrationData.password,
        gender: registrationData.gender,
      };
      const newuser = await user_api.register(mappedData);
      setUser((prev) => ({
        ...prev!,
        ...newuser,
      }));
      message.success("Registration successful");
      navigate("/quiz");
    } catch (error) {
      console.error("Registration failed:", error);
      message.error("Registration failed");
    }
  };

  return (
    <Space
      direction="vertical"
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Space
        direction="vertical"
        style={{
          maxWidth: "400px",
          width: "100%",
          padding: "24px",
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Title style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src={full_logo}
            alt="Mathventure Icon"
            style={{ width: "300px", height: "auto" }}
          />
        </Title>
        <Title level={2} style={{ textAlign: "center" }}>
          !ברוכים הבאים למטיברס
        </Title>
        <Title level={2} style={{ textAlign: "center" }}>
          :בחרו אחת מן האופציות הבאות
        </Title>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "התחברות",
              children: (
                <Form
                  form={loginForm}
                  name="login"
                  onFinish={onLoginFinish}
                  layout="vertical"
                >
                  <Form.Item
                    label="אימייל"
                    name="email"
                    rules={[{ required: true, message: "אנא הכנס את האימייל שלך!" }]}
                  >
                    <Input placeholder="הכנס אימייל" />
                  </Form.Item>
                  <Form.Item
                    label="סיסמא"
                    name="password"
                    rules={[{ required: true, message: "אנא הכנס את הסיסמא שלך!" }]}
                  >
                    <Input.Password placeholder="הכנס סיסמא" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                      התחבר
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: "2",
              label: "הרשמה",
              children: (
                <Form
                  form={registerForm}
                  name="register"
                  onFinish={onRegisterFinish}
                  layout="vertical"
                >
                  <Form.Item
                    label="שם המשתמש"
                    name="username"
                    rules={[{ required: true, message: "אנא הכנס את שם המשתמש!" }]}
                  >
                    <Input placeholder="שם המשתמש" />
                  </Form.Item>
                  <Form.Item
                    label="אימייל"
                    name="email"
                    rules={[
                      { required: true, message: "אנא הכנס את האימייל שלך!" },
                      { type: "email", message: "האימייל אינו תקין!" },
                    ]}
                  >
                    <Input placeholder="אנא הכנס את האימייל שלך!" />
                  </Form.Item>
                  <Form.Item
                    label="סיסמא"
                    name="password"
                    rules={[{ required: true, message: "אנא הכנס סיסמא!" }]}
                  >
                    <Input.Password placeholder="צור סיסמא" />
                  </Form.Item>
                  <Form.Item
                    label="אשר סיסמה"
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                      { required: true, message: "אנא אשר את הסיסמא!" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("הסיסמאות אינן תואמות!")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="אשר את הסיסמא שלך" />
                  </Form.Item>
                  <Form.Item
                    label="מין"
                    name="gender"
                    initialValue="female"
                    rules={[{ required: true, message: "אנא בחר/י מין" }]}
                  >
                    <Radio.Group>
                      <Radio value="female">נקבה</Radio>
                      <Radio value="male">זכר</Radio>
                    </Radio.Group>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                      הירשם
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
        <Space
          direction="horizontal"
          style={{
            width: "100%",
            marginTop: "20px",
            justifyContent: "space-between",
          }}
          align="center"
        >
          <Button icon={<GoogleOutlined />} style={{ width: "30%" }} size="large" />
          <Button icon={<AppleOutlined />} style={{ width: "30%" }} size="large" />
          <Button icon={<FacebookOutlined />} style={{ width: "30%" }} size="large" />
        </Space>
      </Space>
    </Space>
  );
};

export default LoginRegistration;
