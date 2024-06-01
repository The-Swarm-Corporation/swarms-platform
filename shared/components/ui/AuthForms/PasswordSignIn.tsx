'use client';

import React, { useState } from 'react';
import { TextField, Typography, Link as MuiLink, Box, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Link from 'next/link';
import { signInWithPassword } from '@/shared/utils/auth-helpers/server';
import { handleRequest } from '@/shared/utils/auth-helpers/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/Button';

// Define prop type with allowEmail boolean
interface PasswordSignInProps {
  allowEmail: boolean;
  redirectMethod: string;
}

interface Errors {
  email?: string;
  password?: string;
}

export default function PasswordSignIn({
  allowEmail,
  redirectMethod,
}: PasswordSignInProps) {
  const router = redirectMethod === 'client' ? useRouter() : null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: Errors = {};

    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true); // Disable the button while the request is being handled
    await handleRequest(e, signInWithPassword, router);
    setIsSubmitting(false);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const commonTextFieldStyles = {
    '& .MuiInputBase-input': {
      backgroundColor: 'white',
      color: 'black',
      '&.Mui-focused': {
        backgroundColor: 'white',
      },
      '&.Mui-disabled': {
        backgroundColor: 'white',
      },
      '.dark &': {
        backgroundColor: '#374151', // Tailwind's bg-zinc-800
        color: 'white',
      },
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'grey',
      },
      '&:hover fieldset': {
        borderColor: 'lightgrey',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'black',
      },
      '.dark & fieldset': {
        borderColor: 'grey',
      },
      '.dark &:hover fieldset': {
        borderColor: 'lightgrey',
      },
      '.dark &.Mui-focused fieldset': {
        borderColor: 'black',
      },
    },
  };

  return (
    <Box
      className="my-8 max-w-xl mx-auto p-6 rounded-md bg-white dark:bg-black text-black dark:text-white"
    >
      <form noValidate className="mb-4" onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">

            <TextField
              id="email"
              placeholder="name@example.com"
              type="email"
              name="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
              autoComplete="email"
              className='rounded-md'
              autoCorrect="off"
              required
              fullWidth
              variant="outlined"
              error={!!errors.email}
              helperText={errors.email}
              sx={commonTextFieldStyles}
            />

            <TextField
              id="password"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              name="password"
              required
              value={password}
              className='mt-4 rounded-md'
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              fullWidth
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff className='dark:text-[#4e4444]' /> : <Visibility className='dark:text-[#4e4444]' />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={commonTextFieldStyles}
            />
          </div>
          <Button
            variant="outline"
            type="submit"
            className={`mt-1 p-3 rounded-md ${isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-white text-white dark:bg-black '
              }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>
      <Typography className="text-sm">
        <MuiLink component={Link} href="/signin/forgot_password" className="font-light dark:text-white" underline="none">
          Forgot your password?
        </MuiLink>
      </Typography>
      {allowEmail && (
        <Typography className="text-sm mt-4">
          <MuiLink component={Link} href="/signin/email_signin" className="font-light dark:text-white" underline="none">
            Sign in via magic link
          </MuiLink>
        </Typography>
      )}
      <Typography className="text-sm mt-4">
        <MuiLink component={Link} href="/signin/signup" className="font-light dark:text-white" underline="none">
          Don't have an account? Sign up
        </MuiLink>
      </Typography>
    </Box>
  );
}
