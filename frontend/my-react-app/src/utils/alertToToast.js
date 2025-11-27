// Helper function to convert alert() calls to toast notifications
// This function parses alert messages and determines the appropriate toast type

export const showToastFromAlert = (message, toast) => {
  if (!toast || !message) return;
  
  const msg = String(message);
  
  // Parse multi-line messages
  const lines = msg.split('\n');
  const title = lines.length > 1 ? lines[0] : null;
  const messageText = lines.length > 1 ? lines.slice(1).join('\n') : msg;
  
  // Determine type based on content
  if (msg.includes('✅') || msg.includes('Successfully') || msg.toLowerCase().includes('success')) {
    toast.success(messageText, { title: title?.replace(/✅/g, '').trim() || 'Success' });
  } else if (msg.includes('❌') || msg.includes('Failed') || msg.includes('Error') || msg.toLowerCase().includes('error')) {
    toast.error(messageText, { title: title?.replace(/❌/g, '').trim() || 'Error' });
  } else if (msg.includes('⚠️') || msg.includes('Warning') || msg.toLowerCase().includes('warning')) {
    toast.warning(messageText, { title: title?.replace(/⚠️/g, '').trim() || 'Warning' });
  } else if (msg.includes('⏱️') || msg.toLowerCase().includes('cooldown') || msg.toLowerCase().includes('wait')) {
    toast.warning(messageText, { title: title?.replace(/⏱️/g, '').trim() || 'Please Wait' });
  } else {
    toast.info(messageText, { title: title || null });
  }
};

