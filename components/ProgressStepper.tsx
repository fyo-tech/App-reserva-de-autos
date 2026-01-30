import React from 'react';
import { CheckIcon } from './IconComponents';

type AppStep = 'DATE_SELECTION' | 'LIST' | 'FORM' | 'CALENDAR' | 'HOTEL' | 'SUCCESS';

interface ProgressStepperProps {
  currentStep: AppStep;
}

const steps = ['Fechas', 'Vehículo', 'Detalles', 'Hotelería', 'Confirmado'];

const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep }) => {
  const getStepIndex = () => {
    switch (currentStep) {
      case 'DATE_SELECTION':
        return 0;
      case 'LIST':
        return 1;
      case 'FORM':
        return 2;
      case 'HOTEL':
        return 3;
      case 'SUCCESS':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex();

  return (
    <div className="w-full max-w-5xl mx-auto">
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center">
          {steps.map((step, index) => {
            const isCompleted = index < activeIndex;
            const isActive = index === activeIndex;
            const isPastOrActive = isCompleted || isActive;

            return (
              <React.Fragment key={step}>
                {/* Step Item */}
                <li className="flex items-center">
                  <span
                    className={`relative w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors duration-300
                      ${isPastOrActive
                        ? 'bg-fyo-blue text-white'
                        : 'bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-500 text-slate-500 dark:text-slate-400'
                      }
                    `}
                  >
                    {isCompleted ? <CheckIcon className="w-5 h-5" /> : <span>{index + 1}</span>}
                  </span>
                  <span
                    className={`hidden sm:inline-block ml-3 text-sm font-medium transition-colors duration-300
                      ${isPastOrActive
                        ? 'text-fyo-blue dark:text-slate-200'
                        : 'text-slate-500 dark:text-slate-400'
                      }
                    `}
                  >
                    {step}
                  </span>
                </li>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <li className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${index < activeIndex ? 'bg-fyo-blue' : 'bg-slate-300 dark:bg-slate-600'}`} />
                )}
              </React.Fragment>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default ProgressStepper;
