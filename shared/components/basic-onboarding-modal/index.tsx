'use client';

import useOnboardingHelper from '@/shared/hooks/onboarding-helper';
import Modal from '../modal';
import { useEffect, useState } from 'react';
import Input from '../ui/Input';
import { Button } from '../ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useToast } from '../ui/Toasts/use-toast';
import Link from 'next/link';
import { SWARM_CALENDLY } from '@/shared/constants/links';
import { ArrowLeft } from 'lucide-react';
import { Textarea } from '../ui/textarea';

const BasicOnboardingModal = () => {
  const helper = useOnboardingHelper();
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [howDidYouFindUs, setHowDidYouFindUs] = useState('');
  const [whyDidYouSignUp, setWhyDidYouSignUp] = useState('');
  const [aboutCompany, setAboutCompany] = useState('');

  const toast = useToast();
  const [step, setStep] = useState<'basic' | 'company' | 'referral' | 'done'>(
    'basic',
  );

  useEffect(() => {
    if (helper.getOnboarding.data?.basic_onboarding_completed === false) {
      setShowModal(true);
      const fullName = helper.getOnboarding.data.full_name;
      if (fullName) {
        setFullName(fullName);
      }
    }
  }, [helper.getOnboarding.data]);

  const next = async () => {
    if (step === 'basic') {
      // check if not empty
      if (fullName.trim() === '') {
        toast.toast({
          title: 'Full name is required',
        });
        return;
      }
      setStep('company');
    } else if (step === 'company') {
      // check if not empty
      if (companyName.trim() === '' || jobTitle.trim() === '') {
        toast.toast({
          title: 'Company name and job title is required',
        });
        return;
      }
      setStep('referral');
    } else if (step === 'referral') {
      if (!howDidYouFindUs || whyDidYouSignUp.trim() === '') {
        toast.toast({
          title: 'referral and why did you sign up is required',
        });
        return;
      }
      await helper.updateOnboarding
        .mutateAsync({
          full_name: fullName,
          company_name: companyName,
          about_company: aboutCompany,
          job_title: jobTitle,
          referral: howDidYouFindUs,
          signup_reason: whyDidYouSignUp,
          basic_onboarding_completed: true,
        })
        .then(() => {
          setStep('done');
        });
    }
  };
  const closeAction = () => {
    setShowModal(false);
  };

  const jobs = [
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'machine Learning Engineer',
    'Designer',
    'Sales',
    'Marketing',
    'Customer Support',
    'Operations',
    'Finance',
    'HR',
    'Legal',
    'Other',
  ];

  const howDidYouFindUsOptions = [
    'Google',
    'Github',
    'Facebook',
    'X / Twitter',
    'Youtube',
    'Producthunt',
    'LinkedIn',
    'Instagram',
    'Friend',
    'Other',
  ];

  const back = () => {
    if (step === 'company') {
      setStep('basic');
    } else if (step === 'referral') {
      setStep('company');
    }
  };
  return (
    <Modal
      showHeader={false}
      className="py-4"
      isOpen={showModal}
      onClose={closeAction}
    >
      <>
        {/* back step icon */}
        {step != 'basic' && step != 'done' && (
          <ArrowLeft
            size={24}
            onClick={back}
            className="cursor-pointer absolute top-4 left-4"
          />
        )}

        {step != 'done' && (
          <div className="flex justify-center">
            <h1 className="text-xl">
              {
                {
                  basic: 'Welcome to Swarms!',
                  company: 'Tell us about your company',
                  referral: 'How did you find us?',
                }[step]
              }
            </h1>
          </div>
        )}
        <div className="flex flex-col my-2 gap-4">
          {step === 'basic' && (
            <>
              {/* fullname */}
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium"
                >
                  Full Name
                </label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(v) => {
                    setFullName(v);
                  }}
                  // on enter : next
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      next();
                    }
                  }}
                  className="mt-1"
                />
              </div>
            </>
          )}
          {step === 'referral' && (
            <>
              {/* how did you find us */}
              <div>
                <Select
                  onValueChange={(value) => {
                    setHowDidYouFindUs(value);
                  }}
                  value={howDidYouFindUs}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="How did you find us?" />
                  </SelectTrigger>
                  <SelectContent>
                    {howDidYouFindUsOptions?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* why did you sign up */}
              <div>
                <label
                  htmlFor="why_did_you_sign_up"
                  className="block text-sm font-medium"
                >
                  Why did you sign up?
                </label>
                <Input
                  placeholder="I want to automate my operations."
                  id="why_did_you_sign_up"
                  value={whyDidYouSignUp}
                  onChange={(v) => {
                    setWhyDidYouSignUp(v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      next();
                    }
                  }}
                  className="mt-1"
                />
              </div>
            </>
          )}
          {step === 'company' && (
            <>
              {/* company name */}
              <div>
                <label
                  htmlFor="company_name"
                  className="block text-sm font-medium"
                >
                  Company Name
                </label>
                <Input
                  placeholder="Google"
                  id="company_name"
                  value={companyName}
                  onChange={(v) => {
                    setCompanyName(v);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      next();
                    }
                  }}
                  className="mt-1"
                />
              </div>
              {/* job title */}
              <div>
                <Select
                  onValueChange={(value) => {
                    setJobTitle(value);
                  }}
                  value={jobTitle}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Job title" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs?.map((job) => (
                      <SelectItem key={job} value={job}>
                        {job}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* about company */}
              <div>
                <label
                  htmlFor="about_company"
                  className="block text-sm font-medium"
                >
                  About Company
                </label>
                <Textarea
                  placeholder="What does your company do?"
                  id="about_company"
                  value={aboutCompany}
                  onChange={(e) => {
                    setAboutCompany(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      next();
                    }
                  }}
                  className="mt-1"
                />
              </div>
            </>
          )}
          {step === 'done' && (
            <div className="flex flex-col gap-4 items-center">
              <h1 className="text-2xl text-center">Welcome to Swarms</h1>
              <p className="text-center">
                Book a discovery call to learn more about Swarms and how Swarms
                can help you automate operations!
              </p>
              <Link href={SWARM_CALENDLY} target="_blank">
                <Button>Book a call</Button>
              </Link>
              <Link
                href="https://swarms.world/platform/explorer"
              >
                <Button>Explore Models & Swarms</Button>
              </Link>
              <Link
                href="https://swarms.world/platform/api-keys"
                target="_blank"
              >
                <Button>Create API Key</Button>
              </Link>
            </div>
          )}
          {step != 'done' && (
            <div className="flex justify-center">
              <Button
                disabled={helper.updateOnboarding.isPending}
                onClick={next}
                className="mt-4 w-[200px]"
              >
                {
                  {
                    basic: 'Next',
                    company: 'Next',
                    referral: 'Submit',
                  }[step]
                }
              </Button>
            </div>
          )}
        </div>
      </>
    </Modal>
  );
};

export default BasicOnboardingModal;
