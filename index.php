<?php

ini_set('session.cookie_lifetime', 0); // Session cookie should expire with the session
session_start();

ob_start();
ini_set('error_log', '/home/web2621/domains/roderickgpt.com/public_html/my_custom_error.log');



// Initialize conversation history if not set
if (!isset($_SESSION['conversation_history'])) {
    $_SESSION['conversation_history'] = [];
}

debug_log('Session save path: ' . ini_get('session.save_path'));
debug_log('Session use cookies: ' . ini_get('session.use_cookies'));

// Safe check for session variable
if(isset($_SESSION['conversation_history'])) {
    debug_log('Conversation History: ' . print_r($_SESSION['conversation_history'], true));
} else {
    debug_log('Conversation History: Not set');
}

error_reporting(E_ALL);
require_once('/home/web2621/domains/roderickgpt.com/public_html/vendor/autoload.php');

debug_clear_log();
debug_log('Starting application');

$configFilePath = '/home/web2621/domains/roderickgpt.com/config.php';
debug_log('Config file path: ' . $configFilePath);

if (file_exists($configFilePath)) {
    debug_log('Config file found');
    $config = require_once($configFilePath);
} else {
    debug_log('Error: Configuration file not found');
    die("Error: Configuration file not found at $configFilePath.");
}

if (!isset($config['openai_api_key'])) {
    debug_log('Error: openai_api_key not found in config');
    die("Error: 'openai_api_key' not found in the configuration.");
} else {
    debug_log('openai_api_key found in config');
}

use Slim\Factory\AppFactory;
use Symfony\Component\HttpClient\Psr18Client;
use Tectalic\OpenAi\Authentication;
use Tectalic\OpenAi\Manager;

$auth = new Authentication($config['openai_api_key']);
debug_log('Authentication object created with API key');

$httpClient = new Psr18Client();
debug_log('HTTP Client initialized');

Manager::build($httpClient, $auth);
debug_log('OpenAI Manager built');

$app = AppFactory::create();
debug_log('Slim app created');

$openai = Manager::access();
debug_log('OpenAI client accessed');


debug_log('OpenAI client setup complete');

// Custom CORS middleware
$corsMiddleware = function ($request, $handler) {
    debug_log('Entering CORS middleware');
    $response = $handler->handle($request);
    $response = $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    debug_log('Exiting CORS middleware');
    return $response;
};
$app->add($corsMiddleware);

debug_log('CORS middleware added');

define('SECRET_PASSCODE', 'TBWA');
define('PORT', 3000);
debug_log('Constants defined');

if (headers_sent()) {
    die('Cannot redirect, headers already sent');
}

$app->get('/', function ($request, $response) {
    if (isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true) {
        // Determine the appropriate HTML file based on the selected flag
        if (!isset($_SESSION['selectedFlag'])) {
            $_SESSION['selectedFlag'] = 'vlag1'; // Default to 'vlag1' if not set
        }
        
        // Choose the HTML file based on the selected flag
        $htmlFilePath = ($_SESSION['selectedFlag'] === 'vlag2') 
            ? '/home/web2621/domains/roderickgpt.com/public_html/main2.html' 
            : '/home/web2621/domains/roderickgpt.com/public_html/main.html';
        
        // Attempt to load the chosen HTML content
        if (file_exists($htmlFilePath)) {
            $htmlContent = file_get_contents($htmlFilePath);
            
            // Modify the background image based on the selected flag
            $backgroundImage = ($_SESSION['selectedFlag'] === 'vlag2') ? 'images/arms4.png' : 'images/arms3.png';
            $htmlContent = str_replace("<!--BACKGROUND_IMAGE-->", $backgroundImage, $htmlContent);
            
            // Inject the JavaScript snippet before the end of the <body> tag
            $javascriptSnippet = "<script type='text/javascript'>var selectedFlagFromPHP = '{$_SESSION['selectedFlag']}';</script>";
            $htmlContent = str_replace("</body>", $javascriptSnippet . "</body>", $htmlContent);
            
        } else {
            $htmlContent = "Error: HTML file not found.";
        }
    } else {
        // Serve the login page if not authenticated
        $loginHtmlPath = '/home/web2621/domains/roderickgpt.com/public_html/login.html';
        if (file_exists($loginHtmlPath)) {
            $htmlContent = file_get_contents($loginHtmlPath);
        } else {
            $htmlContent = "Error: login.html file not found.";
        }
    }
    $response->getBody()->write($htmlContent);
    return $response;
});


$app->get('/login', function ($request, $response) {
    debug_log('Accessed /login route');
    $htmlFilePath = '/home/web2621/domains/roderickgpt.com/public_html/login.html';
    if (file_exists($htmlFilePath)) {
        debug_log('login.html found');
        $htmlContent = file_get_contents($htmlFilePath);
    } else {
        debug_log('login.html not found');
        $htmlContent = 'Error: login.html file not found.';
    }
    $response->getBody()->write($htmlContent);
    return $response;
});

$app->post('/login', function ($request, $response, $args) {
    debug_log('Accessed /login POST route');
    $params = $request->getParsedBody();
    $passcode = $params['passcode'];
    $selectedFlag = $params['selectedFlag'] ?? 'default';
    


    if ($passcode === SECRET_PASSCODE) {
        $_SESSION['authenticated'] = true;
        $_SESSION['selectedFlag'] = $selectedFlag;
        debug_log('Login successful, redirecting to root');
        // Redirect to the root URL
        return $response->withHeader('Location', '/')->withStatus(302);
    } else {
        debug_log('Incorrect passcode entered: ' . $passcode);
        return $response->withHeader('Location', '/login?error=1')->withStatus(302);
}
});


$app->get('/request-access', function ($request, $response) {
    $htmlFilePath = '/home/web2621/domains/roderickgpt.com/public_html/request-access.html';
    if (file_exists($htmlFilePath)) {
        $htmlContent = file_get_contents($htmlFilePath);
    } else {
        $htmlContent = 'Error: File not found.';
        // Optionally, log this error or handle it as needed
    }

    $response->getBody()->write($htmlContent);
    return $response;
});

// Define your fine-tuning controls for more factual responses
const temperature = 0.8;  // Adjusted for less randomness but some variability
const topP = 0.8;         // Adjusted for a balance between randomness and restriction
const frequencyPenalty = 0.8;  // Set within the typical range
const presencePenalty = 0.8;   // Set within the typical range

define('MODEL_DUNGLISH', 'ft:gpt-3.5-turbo-1106:tbwa::8v3bUr5g');
define('MODEL_BRABANTS', 'ft:gpt-3.5-turbo-1106:tbwa::8v2Lx8ts');

$app->post('/chat', function ($request, $response) use ($app, $openai) {
    try {
        debug_log('Entering /chat route');
        $json = file_get_contents('php://input');
        $parsedBody = json_decode($json, true);

        $userMessage = $parsedBody['message'] ?? '';
        debug_log('User message: ' . $userMessage);

        // Initialize or retrieve conversation history
        if (!isset($_SESSION['conversation_history'])) {
            $_SESSION['conversation_history'] = [];
        }

        // Add user's message to conversation history
        $_SESSION['conversation_history'][] = ['role' => 'user', 'content' => $userMessage];

        // Determine the model based on the session flag
        $selectedModel = ($_SESSION['selectedFlag'] === 'vlag2') ? MODEL_BRABANTS : MODEL_DUNGLISH;
        debug_log('Selected OpenAI Model: ' . $selectedModel);

        // System message based on session flag
        $systemMessageContent = ($_SESSION['selectedFlag'] === 'vlag2') 
            ? "Jij bent Roderick Prince voormalig TBWA werknemer reageer altijd met een Brabants accent"
            : "You're Roderick Prince a former TBWA employee respond in Dunglish, English but with a mix of Dutch words in each sentence";

        // Log the system message and the prompt
        debug_log('System Message: ' . $systemMessageContent);
        debug_log('User Message: ' . $userMessage);
        debug_log('Conversation History: ' . print_r($_SESSION['conversation_history'], true));

        $openaiResponse = $openai->chatCompletions()->create(
            new \Tectalic\OpenAi\Models\ChatCompletions\CreateRequest([
                'model' => $selectedModel,
                'messages' => array_merge(
                    [['role' => 'system', 'content' => $systemMessageContent]],
                    $_SESSION['conversation_history']
                ),
                'temperature' => temperature,
                'top_p' => topP,
                'frequency_penalty' => frequencyPenalty,
                'presence_penalty' => presencePenalty,
            ])
        )->toModel();

        debug_log('Session content: ' . print_r($_SESSION['conversation_history'], true));

        if (!empty($openaiResponse) && !empty($openaiResponse->choices)) {
            $aiMessage = $openaiResponse->choices[0]->message->content;
            // Add AI's message to conversation history
            $_SESSION['conversation_history'][] = ['role' => 'assistant', 'content' => $aiMessage];

            debug_log('AI Response: ' . $aiMessage);
            $response->getBody()->write(json_encode(['reply' => trim($aiMessage)]));
        } else {
            $errorResponse = json_encode($openaiResponse);
            debug_log('Error: Empty or invalid response from OpenAI - ' . $errorResponse);
            $response->getBody()->write(json_encode(['error' => 'No valid response from OpenAI', 'openai_error' => $errorResponse]));
        }

        return $response->withHeader('Content-Type', 'application/json');
    } catch (Exception $e) {
        debug_log('Error in /chat route: ' . $e->getMessage());
        $errorResponse = ['error' => 'Internal server error'];
        $response->getBody()->write(json_encode($errorResponse));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});



$app->post('/report', function ($request, $response) {
    try {
        error_log('POST /report: Starting route execution');

        // Fetch and decode the raw body data
        $rawData = $request->getBody()->getContents();
        error_log('Raw body: ' . $rawData);

        // Manually decode the raw body as the parsed body is not providing the expected results
        $parsedBody = json_decode($rawData, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('JSON decode error: ' . json_last_error_msg());
        }

        // Log the parsed body for debugging
        error_log('Parsed body: ' . print_r($parsedBody, true));

        // Encode the parsed body to prepare it for writing to the file
        $reportData = json_encode($parsedBody);
        if ($reportData === false) {
            throw new Exception('JSON encode error: ' . json_last_error_msg());
        }

        // Define the file path and attempt to open the file
        $reportsFilePath = '/home/web2621/domains/roderickgpt.com/public_html/report.jsonl';
        $fileHandle = fopen($reportsFilePath, 'a');
        if ($fileHandle === false) {
            throw new Exception('Cannot open the file for writing');
        }

        // Write the encoded data to the file
        $writeResult = fwrite($fileHandle, $reportData . "\n");
        if ($writeResult === false) {
            throw new Exception('Cannot write to the file');
        }

        // Close the file handle
        fclose($fileHandle);
        error_log('POST /report: Report data written to file using fopen/fwrite/fclose');

        // Send back a successful response
        $response->getBody()->write('Report saved');
        error_log('POST /report: Response sent back to client');

        return $response;

    } catch (Exception $e) {
        error_log('POST /report Exception: ' . $e->getMessage());
        $response = $response->withStatus(500);
        $response->getBody()->write('Error saving report: ' . $e->getMessage());
        error_log('POST /report: Error response sent back to client with message: ' . $e->getMessage());
        return $response;
    }
});



$app->get('/report.svg', function ($request, $response) {
    $imagePath = '/home/web2621/domains/roderickgpt.com/public_html/report.svg'; // Update with the actual path to your image
    return $response->withHeader('Content-Type', 'image/svg+xml')
                    ->withHeader('Content-Disposition', 'inline; filename="report.svg"')
                    ->write(file_get_contents($imagePath));
});

$app->post('/signup', function ($request, $response) {
    // Retrieve data from the form
    $formData = $request->getParsedBody();

    // Define the file where data will be stored
    $dataFile = '/home/web2621/domains/roderickgpt.com/public_html/datafile.json';

    // Read existing data from the file
    if (file_exists($dataFile)) {
        $existingData = json_decode(file_get_contents($dataFile), true);
        if (!is_array($existingData)) {
            $existingData = [];
        }
    } else {
        $existingData = [];
    }

    // Add new form data to the existing data
    $existingData[] = $formData;

    // Write updated data back to the file
    file_put_contents($dataFile, json_encode($existingData, JSON_PRETTY_PRINT));

    // Redirect to the success page
    return $response->withStatus(200)->withHeader('Content-Type', 'application/json')->write(json_encode(['success' => true]));
});

function checkLogin() {
    session_start(); // Ensure session is started
    if (!isset($_SESSION['authenticated']) || $_SESSION['authenticated'] !== true) {
        header('Location: /login'); // Redirect to login page
        exit; // Prevent further execution
    }
}



// Debugging function to clear the log
function debug_clear_log() {
    $logFile = 'debug.log';
    file_put_contents($logFile, ''); // Clear the contents of the log file
}



// Debugging function
function debug_log($message) {
    $logFile = 'debug.log';
    $currentMemoryUsage = memory_get_usage() / 1024 / 1024; // Convert to MB
    $formattedMessage = sprintf("[%s] Memory: %.2f MB - %s\n", date('Y-m-d H:i:s'), $currentMemoryUsage, $message);
    file_put_contents($logFile, $formattedMessage, FILE_APPEND);
}

$app->run();
debug_log('Application terminated');
ob_end_flush(); // Send output to the browser

?>
