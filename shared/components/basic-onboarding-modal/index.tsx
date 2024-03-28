import useOnboardingHelper from '@/shared/hooks/onboarding-helper';
import Modal from '../modal';
import { useEffect, useState } from 'react';
import Input from '../ui/Input';
import { Button } from '../ui/Button';

const BasicOnboardingModal = () => {
  const helper = useOnboardingHelper();
  const [showModal, setShowModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  // const [countryCode, setCountryCode] = useState('');

  const [step, setStep] = useState<'basic' | 'company' | 'done'>('basic');

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
      setStep('company');
    } else if (step === 'company') {
      await helper.updateOnboarding.mutate({
        full_name: fullName,
        company_name: companyName,
        job_title: jobTitle,
        basic_onboarding_completed: true
      });
      setStep('done');
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
    'Other'
  ];
  return (
    <Modal
      showHeader={false}
      className=" py-4"
      isOpen={showModal}
      onClose={closeAction}
    >
      <>
        <div className="flex justify-center">
          <h1 className="text-2xl">Welcome to Swarms!</h1>
        </div>

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
                  value={fullName}
                  onChange={(v) => {
                    setFullName(v);
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
                  id="company_name"
                  value={companyName}
                  onChange={(v) => {
                    setCompanyName(v);
                  }}
                  className="mt-1"
                />
              </div>
              {/* job title */}
              <div>
                <label
                  htmlFor="job_title"
                  className="block text-sm font-medium"
                >
                  Job Title
                </label>
                <Input
                  id="job_title"
                  value={jobTitle}
                  onChange={(v) => {
                    setJobTitle(v);
                  }}
                  className="mt-1"
                />
              </div>
            </>
          )}
          {step === 'done' ? (
            <></>
          ) : (
            <div className="flex justify-center">
              <Button onClick={next} className="mt-4 w-[200px]">
                {
                  {
                    basic: 'Next',
                    company: 'Submit'
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
