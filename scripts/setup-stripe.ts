#!/usr/bin/env npx tsx
/**
 * Stripe Setup Script
 *
 * This script helps configure Stripe environment variables for the LMS.
 * It will:
 * 1. Check if .env exists (create if not)
 * 2. Read existing env vars
 * 3. Prompt for missing Stripe keys
 * 4. Validate the STRIPE_SECRET_KEY
 * 5. Write variables to .env
 *
 * Usage: npm run setup:stripe
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import Stripe from 'stripe';

const ENV_PATH = path.join(process.cwd(), '.env');

// Stripe environment variables we need to configure
const STRIPE_ENV_VARS = [
  {
    key: 'STRIPE_SECRET_KEY',
    prompt: 'Stripe Secret Key (starts with sk_)',
    required: true,
    sensitive: true,
  },
  {
    key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    prompt: 'Stripe Publishable Key (starts with pk_)',
    required: true,
    sensitive: false,
  },
  {
    key: 'STRIPE_WEBHOOK_SECRET',
    prompt: 'Stripe Webhook Secret (starts with whsec_)',
    required: true,
    sensitive: true,
  },
  {
    key: 'STRIPE_STARTER_PRICE_ID',
    prompt: 'Stripe Price ID for STARTER tier (starts with price_)',
    required: false,
    sensitive: false,
  },
  {
    key: 'STRIPE_PRO_PRICE_ID',
    prompt: 'Stripe Price ID for PRO tier (starts with price_)',
    required: false,
    sensitive: false,
  },
  {
    key: 'STRIPE_ENTERPRISE_PRICE_ID',
    prompt: 'Stripe Price ID for ENTERPRISE tier (starts with price_)',
    required: false,
    sensitive: false,
  },
];

// Create readline interface for user input
function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Prompt user for input
function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Read existing .env file and parse into object
function readEnvFile(): Record<string, string> {
  const envVars: Record<string, string> = {};

  if (!fs.existsSync(ENV_PATH)) {
    console.log('\n📄 .env file not found. Will create a new one.\n');
    return envVars;
  }

  const content = fs.readFileSync(ENV_PATH, 'utf-8');
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) continue;

    const key = trimmed.substring(0, equalIndex);
    let value = trimmed.substring(equalIndex + 1);

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    envVars[key] = value;
  }

  return envVars;
}

// Write env vars back to .env file
function writeEnvFile(envVars: Record<string, string>): void {
  // Read existing file to preserve comments and structure
  let existingContent = '';
  const existingLines: string[] = [];
  const existingKeys = new Set<string>();

  if (fs.existsSync(ENV_PATH)) {
    existingContent = fs.readFileSync(ENV_PATH, 'utf-8');
    existingLines.push(...existingContent.split('\n'));

    // Track which keys already exist
    for (const line of existingLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex !== -1) {
        existingKeys.add(trimmed.substring(0, equalIndex));
      }
    }
  }

  // Update existing lines with new values
  const updatedLines = existingLines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return line;

    const equalIndex = trimmed.indexOf('=');
    if (equalIndex === -1) return line;

    const key = trimmed.substring(0, equalIndex);
    if (key in envVars) {
      return `${key}=${envVars[key]}`;
    }
    return line;
  });

  // Add new Stripe section if any new keys need to be added
  const newStripeKeys = Object.keys(envVars).filter(
    (key) => key.includes('STRIPE') && !existingKeys.has(key)
  );

  if (newStripeKeys.length > 0) {
    // Check if there's already a Stripe section
    const hasStripeSection = updatedLines.some((line) =>
      line.includes('# Stripe') || line.includes('#Stripe')
    );

    if (!hasStripeSection) {
      updatedLines.push('');
      updatedLines.push('# Stripe Configuration');
    }

    for (const key of newStripeKeys) {
      updatedLines.push(`${key}=${envVars[key]}`);
    }
  }

  // Write the file
  fs.writeFileSync(ENV_PATH, updatedLines.join('\n'));
}

// Validate Stripe secret key by making a test API call
async function validateStripeKey(secretKey: string): Promise<boolean> {
  console.log('\n🔄 Validating Stripe secret key...');

  try {
    const stripe = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    });

    // Try to list customers (limit 1) as a simple validation
    await stripe.customers.list({ limit: 1 });

    console.log('✅ Stripe secret key is valid!\n');
    return true;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeAuthenticationError) {
      console.error('❌ Invalid Stripe secret key. Please check your key and try again.\n');
    } else if (error instanceof Error) {
      console.error(`❌ Error validating Stripe key: ${error.message}\n`);
    } else {
      console.error('❌ Unknown error validating Stripe key.\n');
    }
    return false;
  }
}

// Mask sensitive values for display
function maskValue(value: string, sensitive: boolean): string {
  if (!sensitive || value.length < 8) return value;
  return value.substring(0, 7) + '...' + value.substring(value.length - 4);
}

// Main setup function
async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════╗');
  console.log('║        🔧 Stripe Setup Script 🔧           ║');
  console.log('║                                            ║');
  console.log('║  Configure Stripe environment variables    ║');
  console.log('║  for your LMS application.                 ║');
  console.log('╚════════════════════════════════════════════╝');

  const rl = createReadlineInterface();

  try {
    // Read existing env vars
    const envVars = readEnvFile();

    // Check which Stripe vars already exist
    const existingStripeVars = STRIPE_ENV_VARS.filter(
      (v) => envVars[v.key] && envVars[v.key].length > 0
    );

    if (existingStripeVars.length > 0) {
      console.log('\n📋 Found existing Stripe configuration:\n');
      for (const v of existingStripeVars) {
        const displayValue = maskValue(envVars[v.key], v.sensitive);
        console.log(`   ${v.key}: ${displayValue}`);
      }

      const overwrite = await prompt(
        rl,
        '\nDo you want to update existing values? (y/N): '
      );

      if (overwrite.toLowerCase() !== 'y') {
        // Only prompt for missing values
        const missingVars = STRIPE_ENV_VARS.filter(
          (v) => !envVars[v.key] || envVars[v.key].length === 0
        );

        if (missingVars.length === 0) {
          console.log('\n✅ All Stripe variables are already configured!');

          // Still validate the key
          const isValid = await validateStripeKey(envVars['STRIPE_SECRET_KEY']);
          if (!isValid) {
            console.log('⚠️  Consider updating your STRIPE_SECRET_KEY.');
          }

          rl.close();
          return;
        }

        console.log('\n📝 Configuring missing variables:\n');
        for (const v of missingVars) {
          const requiredLabel = v.required ? ' (required)' : ' (optional, press Enter to skip)';
          let value = await prompt(rl, `${v.prompt}${requiredLabel}: `);

          if (v.required && !value) {
            while (!value) {
              console.log('   ⚠️  This field is required.');
              value = await prompt(rl, `${v.prompt}${requiredLabel}: `);
            }
          }

          if (value) {
            envVars[v.key] = value;
          }
        }
      } else {
        // Prompt for all values, showing current as default
        console.log('\n📝 Enter new values (press Enter to keep current):\n');
        for (const v of STRIPE_ENV_VARS) {
          const currentValue = envVars[v.key] || '';
          const currentDisplay = currentValue
            ? ` [current: ${maskValue(currentValue, v.sensitive)}]`
            : '';
          const requiredLabel = v.required ? ' (required)' : ' (optional)';

          const value = await prompt(
            rl,
            `${v.prompt}${requiredLabel}${currentDisplay}: `
          );

          if (value) {
            envVars[v.key] = value;
          } else if (v.required && !currentValue) {
            let newValue = '';
            while (!newValue) {
              console.log('   ⚠️  This field is required.');
              newValue = await prompt(rl, `${v.prompt}${requiredLabel}: `);
            }
            envVars[v.key] = newValue;
          }
        }
      }
    } else {
      // No existing Stripe config, prompt for all
      console.log('\n📝 Please enter your Stripe configuration:\n');

      for (const v of STRIPE_ENV_VARS) {
        const requiredLabel = v.required ? ' (required)' : ' (optional, press Enter to skip)';
        let value = await prompt(rl, `${v.prompt}${requiredLabel}: `);

        if (v.required && !value) {
          while (!value) {
            console.log('   ⚠️  This field is required.');
            value = await prompt(rl, `${v.prompt}${requiredLabel}: `);
          }
        }

        if (value) {
          envVars[v.key] = value;
        }
      }
    }

    // Validate the secret key
    if (envVars['STRIPE_SECRET_KEY']) {
      const isValid = await validateStripeKey(envVars['STRIPE_SECRET_KEY']);

      if (!isValid) {
        const retry = await prompt(
          rl,
          'Would you like to enter a different secret key? (y/N): '
        );

        if (retry.toLowerCase() === 'y') {
          let newKey = await prompt(rl, 'Stripe Secret Key (starts with sk_): ');
          while (newKey && !(await validateStripeKey(newKey))) {
            const tryAgain = await prompt(rl, 'Try again? (y/N): ');
            if (tryAgain.toLowerCase() !== 'y') break;
            newKey = await prompt(rl, 'Stripe Secret Key (starts with sk_): ');
          }
          if (newKey) {
            envVars['STRIPE_SECRET_KEY'] = newKey;
          }
        }
      }
    }

    // Write to .env file
    console.log('💾 Saving configuration to .env...');
    writeEnvFile(envVars);

    console.log('\n✅ Stripe configuration saved successfully!');
    console.log('\n📋 Summary of configured variables:');
    for (const v of STRIPE_ENV_VARS) {
      if (envVars[v.key]) {
        const displayValue = maskValue(envVars[v.key], v.sensitive);
        console.log(`   ✓ ${v.key}: ${displayValue}`);
      } else {
        console.log(`   ○ ${v.key}: not configured`);
      }
    }

    console.log('\n🎉 Setup complete! You can now use Stripe features in your LMS.');
    console.log('\n💡 Tips:');
    console.log('   • For local webhook testing, use: stripe listen --forward-to localhost:3000/api/stripe/webhook');
    console.log('   • Create products and prices in your Stripe Dashboard');
    console.log('   • Run this script again anytime to update configuration\n');

  } finally {
    rl.close();
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
