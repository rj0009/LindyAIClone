
import React from 'react';
import { Template } from '../types';
import { AGENT_TEMPLATES, ICONS } from '../constants';
import IntegrationIcon from '../components/IntegrationIcon';

interface TemplateCardProps {
    template: Template;
    onUse: (template: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onUse }) => {
    return (
        <div className="bg-secondary p-6 rounded-lg border border-border hover:border-accent transition-colors flex flex-col h-full">
            <div className="flex-1">
                <h3 className="text-xl font-bold text-text-primary mb-2">{template.name}</h3>
                <p className="text-text-secondary text-sm mb-4">{template.description}</p>
            </div>
            <div>
                 <div className="flex items-center mb-4">
                    <span className="text-sm text-text-secondary mr-2">Integrations:</span>
                    <div className="flex space-x-1">
                        {template.workflow.map(step => (
                            <IntegrationIcon key={step.id} integrationId={step.integrationId} className="w-6 h-6" />
                        ))}
                    </div>
                </div>
                <button onClick={() => onUse(template)} className="w-full text-center bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors">
                    Use Template
                </button>
            </div>
        </div>
    );
}

interface TemplatesProps {
    onUseTemplate: (template: Template) => void;
}

const Templates: React.FC<TemplatesProps> = ({ onUseTemplate }) => {
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Agent Templates</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {AGENT_TEMPLATES.map(template => (
                    <TemplateCard key={template.id} template={template} onUse={onUseTemplate} />
                ))}
            </div>
        </div>
    );
};

export default Templates;
