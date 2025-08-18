
export const processMarkdownContent = (content: string) => {
  console.log('Starting line-by-line processing...');
  
  // Remove title lines from content to avoid duplication
  let processedContent = content
    .replace(/^#\s*Micro Due Diligence Report[:\-\s]*.*$/gim, '')
    .replace(/^Micro Due Diligence Report[:\-\s]*.*$/gim, '')
    .replace(/^\*\*Micro Due Diligence Report[:\-\s]*.*\*\*$/gim, '');

  // Split content into lines for processing
  const lines = processedContent.split('\n');
  const processedLines = [];
  
  // State tracking
  let inFinalRecommendation = false;
  let currentListItems = [];
  let pendingListType = 'ul'; // 'ul' or 'ol'
  let currentSectionType = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Skip empty lines but close lists if needed
    if (!trimmedLine) {
      if (currentListItems.length > 0) {
        processedLines.push(`<${pendingListType} class="list-${pendingListType === 'ul' ? 'disc' : 'decimal'} list-inside space-y-1 mb-4">${currentListItems.join('')}</${pendingListType}>`);
        currentListItems = [];
      }
      continue;
    }

    console.log(`Processing line: "${trimmedLine}"`);

    // Check if we're entering Final Recommendation section
    if (trimmedLine.match(/^#+\s*final\s+recommendation/i) || trimmedLine.match(/^final\s+recommendation/i)) {
      inFinalRecommendation = true;
      console.log('Entering Final Recommendation section');
    }

    // Process markdown headings first
    if (trimmedLine.match(/^# /)) {
      if (currentListItems.length > 0) {
        processedLines.push(`<${pendingListType} class="list-${pendingListType === 'ul' ? 'disc' : 'decimal'} list-inside space-y-1 mb-4">${currentListItems.join('')}</${pendingListType}>`);
        currentListItems = [];
      }
      const headingText = trimmedLine.replace(/^# /, '');
      processedLines.push(`<h1 class="text-3xl font-bold text-white mb-6 pb-3 border-b border-gray-600">${headingText}</h1>`);
      continue;
    }
    
    if (trimmedLine.match(/^## /)) {
      if (currentListItems.length > 0) {
        processedLines.push(`<${pendingListType} class="list-${pendingListType === 'ul' ? 'disc' : 'decimal'} list-inside space-y-1 mb-4">${currentListItems.join('')}</${pendingListType}>`);
        currentListItems = [];
      }
      const headingText = trimmedLine.replace(/^## /, '');
      processedLines.push(`<h2 class="text-2xl font-semibold text-white mb-4 mt-8 pb-2 border-b border-gray-700">${headingText}</h2>`);
      continue;
    }
    
    if (trimmedLine.match(/^### /)) {
      if (currentListItems.length > 0) {
        processedLines.push(`<${pendingListType} class="list-${pendingListType === 'ul' ? 'disc' : 'decimal'} list-inside space-y-1 mb-4">${currentListItems.join('')}</${pendingListType}>`);
        currentListItems = [];
      }
      const headingText = trimmedLine.replace(/^### /, '');
      processedLines.push(`<h3 class="text-xl font-medium text-gray-200 mb-3 mt-6">${headingText}</h3>`);
      continue;
    }
    
    if (trimmedLine.match(/^#### /)) {
      if (currentListItems.length > 0) {
        processedLines.push(`<${pendingListType} class="list-${pendingListType === 'ul' ? 'disc' : 'decimal'} list-inside space-y-1 mb-4">${currentListItems.join('')}</${pendingListType}>`);
        currentListItems = [];
      }
      const headingText = trimmedLine.replace(/^#### /, '');
      processedLines.push(`<h4 class="text-lg font-medium text-gray-300 mb-2 mt-4">${headingText}</h4>`);
      continue;
    }

    // FIXED: Enhanced section header detection with more precise patterns
    // Match patterns like "- Investment green flags:" or "* Investment red flags:"
    const sectionHeaderMatch = trimmedLine.match(/^[\*\-]\s+(Investment\s+green\s+flags|Investment\s+red\s+flags|Critical\s+questions\s+for\s+founders):\s*$/i);
    if (sectionHeaderMatch) {
      console.log(`Found section header: "${trimmedLine}"`);
      
      if (currentListItems.length > 0) {
        processedLines.push(`<${pendingListType} class="list-${pendingListType === 'ul' ? 'disc' : 'decimal'} list-inside space-y-1 mb-4">${currentListItems.join('')}</${pendingListType}>`);
        currentListItems = [];
      }
      
      const sectionType = sectionHeaderMatch[1].toLowerCase();
      
      if (sectionType.includes('green')) {
        processedLines.push('<h4 class="text-lg font-semibold text-green-400 mb-3 mt-6">🟢 Investment Green Flags</h4>');
        currentSectionType = 'green';
        console.log('Added Investment Green Flags header');
      } else if (sectionType.includes('red')) {
        processedLines.push('<h4 class="text-lg font-semibold text-red-400 mb-3 mt-6">🔴 Investment Red Flags</h4>');
        currentSectionType = 'red';
        console.log('Added Investment Red Flags header');
      } else if (sectionType.includes('critical')) {
        processedLines.push('<h4 class="text-lg font-semibold text-gray-300 mb-3 mt-6">❓ Critical Questions for Founders</h4>');
        currentSectionType = 'critical';
        console.log('Added Critical Questions header');
      }
      
      continue;
    }

    // FIXED: Handle indented bullet points (2+ spaces followed by bullet)
    // This matches patterns like "  - Innovative technology" under section headers
    if (line.match(/^\s{2,}[\*\-]\s+(.+)$/)) {
      const match = line.match(/^\s{2,}[\*\-]\s+(.+)$/);
      if (match) {
        const bulletContent = match[1].trim();
        currentListItems.push(`<li class="text-gray-300 mb-2 ml-4">${bulletContent}</li>`);
        pendingListType = 'ul';
        console.log(`Added indented bullet: ${bulletContent.substring(0, 50)}...`);
        continue;
      }
    }

    // Handle bullet points with colons (key-value pairs) - but not section headers
    if (trimmedLine.match(/^[\*\-]\s+([^:]+):\s*(.+)$/) && !trimmedLine.match(/^[\*\-]\s+(Investment|Critical)/i)) {
      const match = trimmedLine.match(/^[\*\-]\s+([^:]+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        currentListItems.push(`<li class="text-gray-300 mb-2 ml-4"><strong class="text-white font-semibold">${key.trim()}:</strong> ${value.trim()}</li>`);
        pendingListType = 'ul';
        console.log(`Added bullet with colon: ${key}`);
        continue;
      }
    }

    // Handle regular bullet points (but not section headers)
    if (trimmedLine.match(/^[\*\-]\s+(.+)$/) && !trimmedLine.match(/^[\*\-]\s+(Investment|Critical)/i)) {
      const match = trimmedLine.match(/^[\*\-]\s+(.+)$/);
      if (match) {
        const bulletContent = match[1].trim();
        currentListItems.push(`<li class="text-gray-300 mb-2 ml-4">${bulletContent}</li>`);
        pendingListType = 'ul';
        console.log(`Added regular bullet: ${bulletContent.substring(0, 50)}...`);
        continue;
      }
    }

    // Handle numbered lists
    if (trimmedLine.match(/^\d+\.\s+(.+)$/)) {
      if (currentListItems.length > 0 && pendingListType === 'ul') {
        processedLines.push(`<ul class="list-disc list-inside space-y-1 mb-4">${currentListItems.join('')}</ul>`);
        currentListItems = [];
      }
      const match = trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (match) {
        const numberedContent = match[1].trim();
        currentListItems.push(`<li class="text-gray-300 mb-2 ml-4">${numberedContent}</li>`);
        pendingListType = 'ol';
        continue;
      }
    }

    // Handle regular paragraphs
    if (trimmedLine.length > 0) {
      if (currentListItems.length > 0) {
        processedLines.push(`<${pendingListType} class="list-${pendingListType === 'ul' ? 'disc' : 'decimal'} list-inside space-y-1 mb-4">${currentListItems.join('')}</${pendingListType}>`);
        currentListItems = [];
      }
      
      // Apply formatting to the line
      let formattedLine = trimmedLine
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="text-gray-200 italic">$1</em>')
        .replace(/(information not available|not available|unavailable)/gi, '<span class="text-red-400 font-medium">$1</span>');
      
      processedLines.push(`<p class="text-gray-300 mb-4 leading-relaxed">${formattedLine}</p>`);
      console.log(`Added paragraph: ${formattedLine.substring(0, 50)}...`);
    }
  }

  // Close any remaining list items
  if (currentListItems.length > 0) {
    processedLines.push(`<${pendingListType} class="list-${pendingListType === 'ul' ? 'disc' : 'decimal'} list-inside space-y-1 mb-4">${currentListItems.join('')}</${pendingListType}>`);
  }

  const result = processedLines.join('\n');
  console.log('Final processed result:', result.substring(0, 500) + '...');
  return result;
};

export const processHTMLContent = (content: string) => {
  // Remove title lines from content to avoid duplication
  let processedContent = content
    .replace(/<h[1-6][^>]*>\s*Micro Due Diligence Report[:\-\s]*.*?<\/h[1-6]>/gi, '')
    .replace(/<p[^>]*>\s*Micro Due Diligence Report[:\-\s]*.*?<\/p>/gi, '')
    .replace(/<strong[^>]*>\s*Micro Due Diligence Report[:\-\s]*.*?<\/strong>/gi, '');

  // FIXED: Handle Investment flags in Final Recommendation section with more precise patterns
  processedContent = processedContent
    // Handle list items that are section headers
    .replace(/<li[^>]*>\s*[\*\-]?\s*Investment\s+green\s+flags:\s*<\/li>/gi, '<h4 class="text-lg font-semibold text-green-400 mb-3 mt-6">🟢 Investment Green Flags</h4>')
    .replace(/<li[^>]*>\s*[\*\-]?\s*Investment\s+red\s+flags:\s*<\/li>/gi, '<h4 class="text-lg font-semibold text-red-400 mb-3 mt-6">🔴 Investment Red Flags</h4>')
    .replace(/<li[^>]*>\s*[\*\-]?\s*Critical\s+questions\s+for\s+founders:\s*<\/li>/gi, '<h4 class="text-lg font-semibold text-gray-300 mb-3 mt-6">❓ Critical Questions for Founders</h4>')
    // Handle standalone text patterns
    .replace(/[\*\-]?\s*Investment\s+green\s+flags:\s*/gi, '<h4 class="text-lg font-semibold text-green-400 mb-3 mt-6">🟢 Investment Green Flags</h4>')
    .replace(/[\*\-]?\s*Investment\s+red\s+flags:\s*/gi, '<h4 class="text-lg font-semibold text-red-400 mb-3 mt-6">🔴 Investment Red Flags</h4>')
    .replace(/[\*\-]?\s*Critical\s+questions\s+for\s+founders:\s*/gi, '<h4 class="text-lg font-semibold text-gray-300 mb-3 mt-6">❓ Critical Questions for Founders</h4>');

  // Style "Information not available" in red
  processedContent = processedContent.replace(
    /(information not available|not available|unavailable)/gi,
    '<span class="text-red-400 font-medium">$1</span>'
  );

  // Process existing list items to bold text before colons (exclude header content)
  processedContent = processedContent.replace(
    /<li([^>]*)>([^<:]+):(?!.*(?:🟢|🔴|❓|Investment|Critical))(.*?)<\/li>/gi,
    '<li$1><strong class="text-white font-semibold">$2:</strong>$3</li>'
  );

  return processedContent;
};
