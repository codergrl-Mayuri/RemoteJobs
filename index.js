const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Get all commits
function getCommits() {
    try {
        const gitLog = execSync('git log --pretty=format:"%H|%an|%ad|%s" --date=format:"%Y-%m-%d %H:%M:%S"')
            .toString()
            .trim();
        return gitLog.split('\n').map(commit => {
            const [hash, author, date, subject] = commit.split('|');
            return { hash, author, date, subject };
        });
    } catch (error) {
        console.log('Error: Not a git repository or git is not installed',error);
        process.exit(1);
    }
}

// Function to update commit date
function updateCommitDate(hash, newDate) {
    try {
        const command = `
            git filter-branch -f --env-filter '
                if [ $GIT_COMMIT = "${hash}" ]; then
                    export GIT_AUTHOR_DATE="${newDate}"
                    export GIT_COMMITTER_DATE="${newDate}"
                fi
            ' --tag-name-filter cat -- --all
        `;
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error('Error updating commit date:', error.message);
        return false;
    }
}

// Function to process commits one by one
async function processCommits(commits) {
    for (let i = 0; i < commits.length; i++) {
        const commit = commits[i];
        console.log('\n----------------------------------------');
        console.log(`Commit ${i + 1}/${commits.length}`);
        console.log(`Hash: ${commit.hash}`);
        console.log(`Author: ${commit.author}`);
        console.log(`Date: ${commit.date}`);
        console.log(`Subject: ${commit.subject}`);
        
        const answer = await new Promise(resolve => {
            rl.question('\nEnter new date (YYYY-MM-DD HH:MM:SS) or press Enter to skip: ', resolve);
        });

        if (answer.trim()) {
            try {
                // Validate date format
                const date = new Date(answer);
                if (isNaN(date.getTime())) {
                    throw new Error('Invalid date');
                }

                console.log('Updating commit date...');
                const success = updateCommitDate(commit.hash, answer);
                if (success) {
                    console.log('Commit date updated successfully!');
                }
            } catch (error) {
                console.log('Invalid date format. Skipping...',error);
            }
        }
    }
}

// Main function
async function main() {
    try {
        const commits = getCommits();
        console.log(`Found ${commits.length} commits.`);
        console.log('Press Enter to view each commit. Enter a new date to modify it.');
        
        await processCommits(commits);
        
        console.log('\nAll commits processed!');
        console.log('To push changes: git push -f origin master');
        console.log('Note: Use force push with caution on shared repositories!');
        
        rl.close();
    } catch (error) {
        console.error('An error occurred:', error.message);
        rl.close();
    }
}

main();