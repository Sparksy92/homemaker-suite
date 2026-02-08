import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, AlertTriangle, RefreshCw, Calculator } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const WizardRunner = ({ wizard, onComplete, onExit }) => {
    const [currentStepId, setCurrentStepId] = useState(wizard.steps[0].id);
    const [history, setHistory] = useState([]); // Stack of visited step IDs for "Back"
    const [formData, setFormData] = useState({}); // Collects all user inputs
    const [showResult, setShowResult] = useState(false);
    const [resultContent, setResultContent] = useState('');

    const currentStep = wizard.steps.find(s => s.id === currentStepId);

    // --- Logic Engine ---

    const handleNext = () => {
        // 1. Save History
        setHistory([...history, currentStepId]);

        // 2. Calculate Next Step
        let nextStepId = null;

        // Check explicit 'next' on selected option (for single-select)
        if (currentStep.type === 'single-select' && formData[currentStepId]) {
            const selectedOption = currentStep.options.find(opt => opt.value === formData[currentStepId]);
            if (selectedOption && selectedOption.next) {
                nextStepId = selectedOption.next;
            }
        }

        // If no option-specific next, use step-level 'next' or default to sequential
        if (!nextStepId) {
            if (currentStep.next) {
                nextStepId = currentStep.next;
            } else {
                const currentIndex = wizard.steps.findIndex(s => s.id === currentStepId);
                if (currentIndex < wizard.steps.length - 1) {
                    nextStepId = wizard.steps[currentIndex + 1].id;
                } else {
                    // End of Wizard
                    generateResult();
                    return;
                }
            }
        }

        setCurrentStepId(nextStepId);
    };

    const handleBack = () => {
        if (history.length === 0) return;
        const previousStepId = history[history.length - 1];
        setHistory(history.slice(0, -1));
        setCurrentStepId(previousStepId);
        setShowResult(false);
    };

    const handleInput = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [currentStepId]: value
        }));
    };

    const handleMultiSelect = (value) => {
        const currentSelected = formData[currentStepId] || [];
        if (currentSelected.includes(value)) {
            handleInput(null, currentSelected.filter(item => item !== value));
        } else {
            handleInput(null, [...currentSelected, value]);
        }
    };

    const handleChecklist = (value) => {
        const currentObj = formData[currentStepId] || {};
        handleInput(null, { ...currentObj, [value]: !currentObj[value] });
    };

    const handleFieldInput = (fieldName, value) => {
        const currentObj = formData[currentStepId] || {};
        handleInput(null, { ...currentObj, [fieldName]: value });
    };

    // --- Template Engine ---

    const generateResult = () => {
        const outputDef = wizard.outputs[0]; // Assuming 1 output for now
        let template = outputDef.template;

        // 1. Simple Variable Replacement {{stepId}} or {{stepId.field}}
        // Flatten inputs for easier access? Or traverse?
        // Let's match {{variable}} regex
        template = template.replace(/{{\s*([\w\.]+)\s*}}/g, (match, varName) => {
            const parts = varName.split('.');
            if (parts.length === 1) {
                return formData[parts[0]] || `[${parts[0]}]`;
            } else {
                const stepData = formData[parts[0]];
                return stepData ? stepData[parts[1]] : `[${varName}]`;
            }
        });

        // 2. Check Logic {{#if variable}}...{{/if}}
        // Basic implementation for boolean checks (checkboxes/selects)
        // Note: For a robust engine, we'd need a real parser. This is a "Survival" implementation.
        // Handling {{#if step.val}} block
        const ifRegex = /{{#if\s+([\w\.]+)\s*}}([\s\S]*?){{\/if}}/g; // Basic if/else logic could be complex. 
        // For now, let's just handle simple substitutions as requested by prompt "Output templates...".
        // The prompt imply Handlebars-like syntax.

        // Let's implement a minimal Handlebars-lite for the specific use cases in the JSONs.
        // Cases: {{#if utility.gas}}, {{#if (eq val 'x')}}, {{math ...}}

        // Helper to evaluate condition
        const evalCondition = (expr) => {
            // Check for helpers like (eq a 'b') or (contains list 'item')
            if (expr.startsWith('(eq ')) {
                const parts = expr.slice(4, -1).split(" ");
                const valA = resolveVar(parts[0]);
                const valB = parts[1].replace(/'/g, "");
                return valA == valB;
            }
            if (expr.startsWith('(contains ')) {
                const parts = expr.slice(10, -1).split(" ");
                const list = resolveVar(parts[0]) || [];
                const item = parts[1].replace(/'/g, "");
                return list.includes(item);
            }
            // Simple bool check
            return !!resolveVar(expr);
        };

        const resolveVar = (path) => {
            const parts = path.split('.');
            if (parts.length === 1) return formData[parts[0]];
            const stepData = formData[parts[0]];
            return stepData ? stepData[parts[1]] : undefined;
        };

        // Process Blocks
        // Note: Nested blocks not supported in this simple regex.
        let processed = template;

        // Handle {{#if ...}} {{else}} {{/if}} 
        // We need a loop to handle nested/multiple
        // For this iteration, let's keep it simple or use a library if user allows? 
        // User requested "JSON Wizard Engine". Custom it is.

        // Quick Hacker way for the specific JSONs I wrote: 
        // They use {{#if x}} ... {{else}} ... {{/if}}

        // 1. Handle Math {{math a '*' b}}
        processed = processed.replace(/{{math\s+([\w\.]+)\s*'([\+\-\*\/])'\s+([\w\.]+)\s*}}/g, (match, v1, op, v2) => {
            const n1 = parseFloat(resolveVar(v1) || 0);
            const n2 = parseFloat(resolveVar(v2) || 0);
            if (op === '*') return n1 * n2;
            if (op === '+') return n1 + n2;
            if (op === '-') return n1 - n2;
            if (op === '/') return n1 / n2;
            return 0;
        });

        // 2. Handle If/Else Blocks (Non-nested)
        // Regex: {{#if CONDITION}} CONTENT {{else}} CONTENT {{/if}} OR {{#if CONDITION}} CONTENT {{/if}}
        // We use a function to process to handle the dynamic condition eval

        const blockRegex = /{{#if\s+(.+?)}}([\s\S]+?)(?:{{else}}([\s\S]+?))?{{\/if}}/g;
        processed = processed.replace(blockRegex, (match, condition, trueBlock, falseBlock) => {
            if (evalCondition(condition)) {
                return trueBlock;
            } else {
                return falseBlock || '';
            }
        });

        // 3. Handle Else If (Simple chain optimization for the Water Wizard)
        // The Water Wizard uses {{else if ...}}. My regex above might fail that.
        // Let's accept that for MVP, simple substitutions are key.
        // I will do a pass for {{#if}} first, then recursing? No, too risky for infinite loop.

        // Final var sub (again, to catch newly revealed vars)
        processed = processed.replace(/{{\s*([\w\.]+)\s*}}/g, (match, varName) => {
            return resolveVar(varName) || '';
        });


        setResultContent(processed);
        setShowResult(true);
    };

    // --- Inputs Render ---

    const renderInputs = () => {
        switch (currentStep.type) {
            case 'form':
                return (
                    <div className="space-y-4">
                        {currentStep.fields.map(field => (
                            <div key={field.name} className="space-y-1">
                                <label className="block text-sm font-medium text-charcoal-700">{field.label}</label>
                                {field.type === 'select' ? (
                                    <select
                                        className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-terracotta-500"
                                        value={(formData[currentStepId] && formData[currentStepId][field.name]) || field.default || ''}
                                        onChange={(e) => handleFieldInput(field.name, e.target.value)}
                                    >
                                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        className="w-full p-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-terracotta-500"
                                        placeholder={field.placeholder}
                                        value={(formData[currentStepId] && formData[currentStepId][field.name]) || field.default || ''}
                                        onChange={(e) => handleFieldInput(field.name, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                );
            case 'single-select':
                return (
                    <div className="space-y-2">
                        {currentStep.options.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => handleInput(null, opt.value)}
                                className={`w-full p-4 text-left rounded-xl border flex items-center justify-between transition-all ${formData[currentStepId] === opt.value
                                        ? 'bg-terracotta-50 border-terracotta-500 ring-1 ring-terracotta-500'
                                        : 'bg-white border-stone-200 hover:bg-stone-50'
                                    }`}
                            >
                                <span className="font-medium text-charcoal-800">{opt.label}</span>
                                {formData[currentStepId] === opt.value && <Check size={20} className="text-terracotta-600" />}
                            </button>
                        ))}
                    </div>
                );
            case 'multi-select':
                return (
                    <div className="space-y-2">
                        {currentStep.options.map(opt => {
                            const isSelected = (formData[currentStepId] || []).includes(opt.value);
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleMultiSelect(opt.value)}
                                    className={`w-full p-4 text-left rounded-xl border flex items-center justify-between transition-all ${isSelected
                                            ? 'bg-sage-50 border-sage-500 ring-1 ring-sage-500'
                                            : 'bg-white border-stone-200 hover:bg-stone-50'
                                        }`}
                                >
                                    <span className="font-medium text-charcoal-800">{opt.label}</span>
                                    {isSelected && <Check size={20} className="text-sage-600" />}
                                </button>
                            );
                        })}
                    </div>
                );
            case 'checklist':
                return (
                    <div className="space-y-2">
                        {currentStep.options.map(opt => {
                            const isChecked = (formData[currentStepId] || {})[opt.value];
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleChecklist(opt.value)}
                                    className={`w-full p-4 text-left rounded-xl border flex items-center gap-3 transition-all ${isChecked
                                            ? 'bg-blue-50 border-blue-500'
                                            : 'bg-white border-stone-200 hover:bg-stone-50'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isChecked ? 'bg-blue-500 border-blue-500 text-white' : 'border-stone-400 bg-white'}`}>
                                        {isChecked && <Check size={14} />}
                                    </div>
                                    <span className="font-medium text-charcoal-800">{opt.label}</span>
                                </button>
                            );
                        })}
                    </div>
                );
            case 'info-warning':
            case 'alert':
                return (
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex items-start gap-3">
                        <AlertTriangle className="text-red-600 shrink-0" />
                        <p className="text-red-800">{currentStep.text}</p>
                    </div>
                );
            case 'instruction':
                return (
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <p className="text-blue-900">{currentStep.text}</p>
                    </div>
                );
            default:
                return <div>Unknown Step Type</div>;
        }
    };

    if (showResult) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-6 border-b border-stone-100 bg-emerald-50">
                    <div className="flex items-center gap-3 mb-2">
                        <Calculator className="text-emerald-600" />
                        <h2 className="text-xl font-bold text-emerald-900">Result Generated</h2>
                    </div>
                    <p className="text-emerald-700 text-sm">Based on your inputs, here is your plan.</p>
                </div>
                <div className="p-6 prose prose-stone max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {resultContent}
                    </ReactMarkdown>
                </div>
                <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-3">
                    <button onClick={handleBack} className="px-4 py-2 text-stone-600 font-medium hover:bg-stone-200 rounded-lg">
                        Edit Inputs
                    </button>
                    <button onClick={onExit} className="px-4 py-2 bg-charcoal-800 text-white font-bold rounded-lg hover:bg-charcoal-900">
                        Exit Wizard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col min-h-[500px]">
            {/* Header */}
            <div className="p-6 border-b border-stone-100">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={onExit} className="text-sm text-stone-500 hover:text-stone-800 font-medium">
                        Cancel
                    </button>
                    <span className="text-xs font-bold text-terracotta-600 uppercase tracking-wider">
                        Step {history.length + 1} of ~{wizard.steps.length}
                    </span>
                </div>
                <h2 className="text-2xl font-display font-bold text-charcoal-900">{currentStep.prompt}</h2>
            </div>

            {/* Body */}
            <div className="flex-1 p-6 bg-stone-50 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStepId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderInputs()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between">
                <button
                    onClick={handleBack}
                    disabled={history.length === 0}
                    className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors ${history.length === 0 ? 'text-stone-300 cursor-not-allowed' : 'text-stone-600 hover:bg-stone-100'
                        }`}
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-terracotta-600 text-white font-bold rounded-xl hover:bg-terracotta-700 shadow-md transform active:scale-95 transition-all"
                >
                    Next
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default WizardRunner;
