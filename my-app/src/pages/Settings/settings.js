import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useAuth } from "../../context/authContext";
import { useTheme } from "../../context/ThemeContext";

// ---------- styled components ----------
const Main = styled.main`
  max-width: 600px;
  margin: 3rem auto;
  padding: 2rem 1.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.md};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  min-height: 400px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled(motion.div)`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const TextInput = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ hasError, theme }) =>
    hasError ? theme.colors.error : theme.colors.border || "#ccc"};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 8px ${({ theme }) => theme.colors.primary}88;
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.background};
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ hasError, theme }) =>
    hasError ? theme.colors.error : theme.colors.border || "#ccc"};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 8px ${({ theme }) => theme.colors.primary}88;
  }

  option {
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const ErrorText = styled.p`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.9rem;
`;

const SuccessText = styled.p`
  margin-top: 4px;
  color: ${({ theme }) => theme.colors.success};
  font-size: 0.9rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  margin-bottom: 8px;
  padding: 8px 0;

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 2rem;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResetButton = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 12px 24px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background};
    transform: translateY(-1px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 18px;
`;

const UserInfo = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 20px;
  margin-bottom: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.border};

  h3 {
    margin: 0 0 12px 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 1.1rem;
  }

  p {
    margin: 4px 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.95rem;
  }

  .auth-badge {
    display: inline-block;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 0.8rem;
    font-weight: 600;
    margin-top: 8px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

// ---------- component ----------
const Settings = ({ initialProfile }) => {
  const { user, updateUser } = useAuth();
  const { mode, setMode } = useTheme();

  // states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [theme, setTheme] = useState(mode || "light");
  const [username, setUsername] = useState(
    initialProfile?.name || user?.name || ""
  );
  const [email, setEmail] = useState(initialProfile?.email || user?.email || "");
  const [errors, setErrors] = useState({});

  // load settings
  useEffect(() => {
    if (user) {
      setUsername(user.name || "");
      setEmail(user.email || "");
    }
    try {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setEmailNotifications(settings.emailNotifications ?? true);
        setPushNotifications(settings.pushNotifications ?? false);
        setTheme(settings.theme ?? "light");
        if (settings.theme) {
          setMode(settings.theme);
        }
      }
    } catch (error) {
      console.error("❌ Error loading settings:", error);
    }
  }, [user, setMode]);

  // auto-clear success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleThemeChange = (e) => {
    const value = e.target.value;
    setTheme(value);
    setMode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // validation
    const newErrors = {};
    if (!username.trim()) newErrors.username = "Display name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSaving(true);
    setSuccessMessage("");

    try {
      const settingsData = {
        name: username.trim(),
        email: email.trim(),
        emailNotifications,
        pushNotifications,
        theme,
      };

      // save to localStorage
      localStorage.setItem("userSettings", JSON.stringify(settingsData));

      // update user profile if function exists
      if (typeof updateUser === "function") {
        await updateUser({ name: username.trim(), email: email.trim() });
      }

      // simulate save delay
      await new Promise((r) => setTimeout(r, 1000));

      setSuccessMessage("Settings saved successfully!");
    } catch (error) {
      setErrors({ submit: "Failed to save settings. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setUsername(user?.name || "");
    setEmail(user?.email || "");
    setEmailNotifications(true);
    setPushNotifications(false);
    setTheme("light");
    setMode("light");
    setErrors({});
    setSuccessMessage("");
  };

  if (loading) {
    return (
      <Main>
        <LoadingContainer>Loading settings...</LoadingContainer>
      </Main>
    );
  }

  return (
    <Main>
      <Title>Settings</Title>

      {/* User Information Display */}
      <UserInfo>
        <h3>Account Information</h3>
        <p><strong>Name:</strong> {user?.name || 'Not provided'}</p>
        <p><strong>Email:</strong> {user?.email || 'Not provided'}</p>
        <p><strong>Authentication:</strong> Google OAuth</p>
        <div className="auth-badge">✓ Secure Account</div>
      </UserInfo>

      <Form onSubmit={handleSubmit}>
        {/* Profile Section */}
        <SectionTitle>Profile Settings</SectionTitle>
        
        <FormGroup>
          <Label htmlFor="username">Display Name</Label>
          <TextInput
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            hasError={!!errors.username}
            placeholder="Enter your display name"
          />
          {errors.username && <ErrorText>{errors.username}</ErrorText>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email Address</Label>
          <TextInput
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            hasError={!!errors.email}
            placeholder="Enter your email address"
            disabled // Disable email editing since it's managed by Google OAuth
          />
          {errors.email && <ErrorText>{errors.email}</ErrorText>}
          <SuccessText style={{ fontSize: '0.8rem', marginTop: '4px' }}>
            Email is managed by your Google account
          </SuccessText>
        </FormGroup>

        {/* Notifications Section */}
        <SectionTitle>Notification Preferences</SectionTitle>
        
        <FormGroup>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={() => setEmailNotifications((p) => !p)}
            />
            <div>
              <strong>Email Notifications</strong>
              <br />
              <small style={{ color: 'var(--text-secondary)' }}>
                Receive email alerts for job deadlines and interviews
              </small>
            </div>
          </CheckboxLabel>
          
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={() => setPushNotifications((p) => !p)}
            />
            <div>
              <strong>Push Notifications</strong>
              <br />
              <small style={{ color: 'var(--text-secondary)' }}>
                Get browser notifications for important updates
              </small>
            </div>
          </CheckboxLabel>
        </FormGroup>

        {/* Appearance Section */}
        <SectionTitle>Appearance</SectionTitle>
        
        <FormGroup>
          <Label htmlFor="theme">Theme Preference</Label>
          <Select id="theme" value={theme} onChange={handleThemeChange}>
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
            <option value="auto">Auto (System Preference)</option>
          </Select>
        </FormGroup>

        {errors.submit && <ErrorText>{errors.submit}</ErrorText>}
        {successMessage && <SuccessText>{successMessage}</SuccessText>}

        <ButtonGroup>
          <ResetButton type="button" onClick={handleReset}>
            Reset to Default
          </ResetButton>
          <SubmitButton type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </SubmitButton>
        </ButtonGroup>
      </Form>
    </Main>
  );
};

export default Settings;
