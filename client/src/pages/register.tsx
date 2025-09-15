import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Register() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest('POST', '/api/register', data);
      if (!response.ok) throw new Error((await response.json()).message || 'Registration failed');
      return response.json();
    },
    onSuccess: async (data) => {
      toast({ title: "Registration successful", description: `Welcome, ${data.user.fullName}!` });
      // Auto login after register
      await loginMutation.mutateAsync({ username: formData.username, password: formData.password });
    },
    onError: (error: any) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/login', data);
      if (!response.ok) throw new Error((await response.json()).message || 'Login failed');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      navigate('/');
      
    },
    onError: (error: any) => {
      toast({ title: "Auto login failed", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.username || !formData.password || !formData.email || !formData.fullName) {
      toast({ title: "Missing information", description: "Please fill all fields", variant: "destructive" });
      setLoading(false);
      return;
    }
    registerMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t('Register')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={formData.username} onChange={e => handleInputChange('username', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={formData.fullName} onChange={e => handleInputChange('fullName', e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('Registering...') : t('Register')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
